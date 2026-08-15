import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import parsePhoneNumberFromString from 'libphonenumber-js'
import { FindManyOptions, FindOneOptions, FindOptionsRelations } from 'typeorm'

import { WithRelations } from '../db/db.types'
import { ClientsRepository } from './clients.repository'
import { Client } from './entities/client.entity'

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  @Transactional()
  async createWithGeneratedCode(): Promise<Client> {
    await this.clientsRepository.lockCodeAllocation()

    const code = await this.clientsRepository.getNextCode()
    return this.insertWithCode(code)
  }

  @Transactional()
  async findOrCreateByCode(code: number): Promise<Client> {
    if (!Number.isInteger(code) || code < 1) {
      throw new BadRequestException('INVALID_CLIENT_CODE')
    }

    await this.clientsRepository.lockCodeAllocation()

    const existingClient = await this.clientsRepository.findOne({
      where: { code },
    })

    if (existingClient) {
      return existingClient
    }

    return this.insertWithCode(code)
  }

  @Transactional()
  async resolveForNewUser(phoneNumber: unknown): Promise<Client> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber)

    if (normalizedPhone) {
      const matchingClient = await this.clientsRepository.findOne({
        where: { legacyPhoneNormalized: normalizedPhone },
        relations: { user: true },
      })

      if (matchingClient?.user) {
        throw new ConflictException('CLIENT_ALREADY_LINKED')
      }

      if (matchingClient) {
        return matchingClient
      }
    }

    return this.createWithGeneratedCode()
  }

  async find<R extends FindOptionsRelations<Client>>(
    options?: Omit<FindManyOptions<Client>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<Client, R>[]> {
    return this.clientsRepository.find(options)
  }

  async findOneOrThrow<R extends FindOptionsRelations<Client>>(
    options: Omit<FindOneOptions<Client>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<Client, R>> {
    return this.clientsRepository.findOneOrThrow(options)
  }

  private normalizePhoneNumber(phoneNumber: unknown): string | null {
    if (typeof phoneNumber !== 'string') {
      return null
    }

    const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber)

    return parsedPhoneNumber?.isValid() ? parsedPhoneNumber.number : null
  }

  private async insertWithCode(code: number): Promise<Client> {
    const client = this.clientsRepository.create({
      code,
      legacyPhoneRaw: null,
      legacyPhoneNormalized: null,
    })

    await this.clientsRepository.insert(client)
    return client
  }
}
