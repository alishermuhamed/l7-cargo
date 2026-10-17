import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import parsePhoneNumberFromString from 'libphonenumber-js'
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  In,
} from 'typeorm'

import { WithRelations } from '../db/db.types'
import { ClientsRepository } from './clients.repository'
import { Client } from './entities/client.entity'
import { LegacyClientCodeAliasRepository } from './legacy-client-code-alias.repository'

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientsRepository: ClientsRepository,
    private readonly legacyClientCodeAliasRepository: LegacyClientCodeAliasRepository
  ) {}

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

    const existingClient = await this.findOneByClientCode(code)

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

  async findOneByClientCode(code: number): Promise<Client | null> {
    const client = await this.clientsRepository.findOne({ where: { code } })

    if (client) {
      return client
    }

    const alias = await this.legacyClientCodeAliasRepository.findOne({
      where: { code },
      relations: { client: true },
    })

    return alias?.client ?? null
  }

  async findByCodes(codes: number[]): Promise<Map<number, Client>> {
    const clientsByCode = new Map<number, Client>()

    if (codes.length === 0) {
      return clientsByCode
    }

    const [clients, aliases] = await Promise.all([
      this.clientsRepository.find({ where: { code: In(codes) } }),
      this.legacyClientCodeAliasRepository.find({
        where: { code: In(codes) },
        relations: { client: true },
      }),
    ])

    for (const alias of aliases) {
      clientsByCode.set(alias.code, alias.client)
    }

    for (const client of clients) {
      clientsByCode.set(client.code, client)
    }

    return clientsByCode
  }

  async findLegacyCodesByClientIds(
    clientIds: string[]
  ): Promise<Map<string, number[]>> {
    const aliases =
      await this.legacyClientCodeAliasRepository.findByClientIds(clientIds)
    const codesByClientId = new Map<string, number[]>()

    for (const alias of aliases) {
      const codes = codesByClientId.get(alias.clientId) ?? []
      codes.push(alias.code)
      codesByClientId.set(alias.clientId, codes)
    }

    for (const codes of codesByClientId.values()) {
      codes.sort((first, second) => first - second)
    }

    return codesByClientId
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
