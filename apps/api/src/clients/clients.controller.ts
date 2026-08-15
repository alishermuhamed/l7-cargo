import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { ILike, Raw } from 'typeorm'

import { ClientsMapper } from './clients.mapper'
import { ClientsPolicy } from './clients.policy'
import { ClientsService } from './clients.service'
import { GetClientResponseDto } from './dtos/get-client-response.dto'
import { GetClientsQueryDto } from './dtos/get-clients-query.dto'

const CLIENT_ID_PARAM = 'clientId'

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsPolicy: ClientsPolicy,
    private readonly clientsService: ClientsService
  ) {}

  @Get()
  async getClients(
    @Query() { search, limit, offset }: GetClientsQueryDto
  ): Promise<GetClientResponseDto[]> {
    this.clientsPolicy.checkCanList()

    const where = search
      ? [
          {
            code: Raw((alias) => `CAST(${alias} AS text) ILIKE :search`, {
              search: `%${search}%`,
            }),
          },
          { legacyPhoneRaw: ILike(`%${search}%`) },
          { user: { name: ILike(`%${search}%`) } },
          { user: { phoneNumber: ILike(`%${search}%`) } },
        ]
      : undefined

    const clients = await this.clientsService.find({
      where,
      relations: { user: true },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    })

    return clients.map((client) => ClientsMapper.toGetClientResponseDto(client))
  }

  @Get(`:${CLIENT_ID_PARAM}`)
  async getClient(
    @Param(CLIENT_ID_PARAM, ParseUUIDPipe) clientId: string
  ): Promise<GetClientResponseDto> {
    await this.clientsPolicy.checkCanRead(clientId)

    const client = await this.clientsService.findOneOrThrow({
      where: { id: clientId },
      relations: { user: true },
    })

    return ClientsMapper.toGetClientResponseDto(client)
  }
}
