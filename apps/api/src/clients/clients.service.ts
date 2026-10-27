import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { In } from 'typeorm'

import { INT32_MAX } from '../common/integer.constants'
import { WithRelations } from '../db/db.types'
import { ClientCodeAliasesRepository } from './client-code-aliases.repository'
import { ClientsRepository } from './clients.repository'
import { GetClientsOptions } from './clients.types'
import { Client } from './entities/client.entity'

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientsRepository: ClientsRepository,
    private readonly clientCodeAliasRepository: ClientCodeAliasesRepository
  ) {}

  async getClients(
    options: GetClientsOptions
  ): Promise<WithRelations<Client, { user: true; codeAliases: true }>[]> {
    return this.clientsRepository.getClients(options)
  }

  async getClient(
    clientId: string
  ): Promise<WithRelations<Client, { user: true; codeAliases: true }>> {
    return this.clientsRepository.findOneOrThrow({
      where: { id: clientId },
      relations: { user: true, codeAliases: true },
    })
  }

  async lockForMerge(ids: string[]): Promise<void> {
    await this.clientsRepository.lockCodeAllocation()

    for (const id of [...ids].sort()) {
      await this.clientsRepository.findOneOrThrow({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      })
    }
  }

  async absorbClient(target: Client, source: Client): Promise<void> {
    await this.clientCodeAliasRepository.update(
      { clientId: source.id },
      { clientId: target.id }
    )

    await this.clientsRepository.delete({ id: source.id })

    if (source.code > 0) {
      await this.insertAlias(target.id, source.code)
    }
  }

  @Transactional()
  async findOrCreateByCode(code: number): Promise<Client> {
    this.validatePositiveCode(code)

    await this.clientsRepository.lockCodeAllocation()

    const existingClient = await this.findOneByClientCode(code)

    if (existingClient) {
      return existingClient
    }

    return this.insertWithCode(code)
  }

  @Transactional()
  async resolveForNewUser(phoneNumber: string): Promise<Client> {
    const matchingClient = await this.clientsRepository.findOne({
      where: { legacyPhoneNormalized: phoneNumber },
      relations: { user: true },
    })

    if (matchingClient?.user) {
      throw new ConflictException('CLIENT_ALREADY_LINKED')
    }

    if (matchingClient) {
      return matchingClient
    }

    await this.clientsRepository.lockCodeAllocation()

    const code = await this.clientsRepository.getNextCode()
    return this.insertWithCode(code)
  }

  @Transactional()
  async updateCode(
    clientId: string,
    code: number,
    expectedCode: number
  ): Promise<void> {
    this.validatePositiveCode(code)

    const client = await this.getClientForCodeChange(clientId)

    if (client.code !== expectedCode) {
      throw new ConflictException('CLIENT_CODES_CHANGED')
    }

    if (client.code === code) {
      return
    }

    await this.assertCodeAvailable(clientId, code)

    await this.clientCodeAliasRepository.delete({ clientId, code })
    await this.clientsRepository.update({ id: clientId }, { code })

    if (client.code > 0) {
      await this.insertAlias(clientId, client.code)
    }
  }

  @Transactional()
  async addAlias(clientId: string, code: number): Promise<void> {
    this.validatePositiveCode(code)

    const client = await this.getClientForCodeChange(clientId)

    if (client.code === code) {
      throw new ConflictException('CLIENT_CODE_IS_PRIMARY')
    }

    await this.assertCodeAvailable(clientId, code)
    await this.insertAlias(clientId, code)
  }

  @Transactional()
  async removeAlias(clientId: string, code: number): Promise<void> {
    this.validatePositiveCode(code)

    const client = await this.getClientForCodeChange(clientId)

    if (client.code === code) {
      throw new ConflictException('CLIENT_CODE_IS_PRIMARY')
    }

    await this.clientCodeAliasRepository.delete({ clientId, code })
  }

  private validatePositiveCode(code: number): void {
    if (!Number.isInteger(code) || code < 1 || code > INT32_MAX) {
      throw new BadRequestException('INVALID_CLIENT_CODE')
    }
  }

  private async getClientForCodeChange(clientId: string): Promise<Client> {
    await this.clientsRepository.lockCodeAllocation()

    const client = await this.clientsRepository.findOne({
      where: { id: clientId },
    })

    if (!client) {
      throw new NotFoundException('CLIENT_NOT_FOUND')
    }

    return client
  }

  private async assertCodeAvailable(
    clientId: string,
    code: number
  ): Promise<void> {
    const owner = await this.findOneByClientCode(code)

    if (owner && owner.id !== clientId) {
      throw new ConflictException('CLIENT_CODE_IN_USE')
    }
  }

  private async insertAlias(clientId: string, code: number): Promise<void> {
    const existing = await this.clientCodeAliasRepository.findOne({
      where: { clientId, code },
    })

    if (!existing) {
      await this.clientCodeAliasRepository.insert(
        this.clientCodeAliasRepository.create({ clientId, code })
      )
    }
  }

  async findOneByClientCode(code: number): Promise<Client | null> {
    const client = await this.clientsRepository.findOne({ where: { code } })

    if (client) {
      return client
    }

    const alias = await this.clientCodeAliasRepository.findOne({
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
      this.clientCodeAliasRepository.find({
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

  async findAliasesByClientIds(
    clientIds: string[]
  ): Promise<Map<string, number[]>> {
    const aliases = await this.clientCodeAliasRepository.find({
      where: { clientId: In(clientIds) },
    })

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

  async findOneByIdOrThrow(clientId: string): Promise<Client> {
    return this.clientsRepository.findOneOrThrow({ where: { id: clientId } })
  }

  async findOneByUserIdOrThrow(userId: string): Promise<Client> {
    return this.clientsRepository.findOneOrThrow({
      where: { user: { id: userId } },
    })
  }

  async findOneWithUserByIdOrThrow(
    clientId: string
  ): Promise<WithRelations<Client, { user: true }>> {
    return this.clientsRepository.findOneOrThrow({
      where: { id: clientId },
      relations: { user: true },
    })
  }

  private async insertWithCode(code: number): Promise<Client> {
    const client = this.clientsRepository.create({ code })
    await this.clientsRepository.insert(client)
    return client
  }
}
