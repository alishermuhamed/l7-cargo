import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ILike, Raw } from 'typeorm'

import { SuccessResponseDto } from '../common/dtos/success-response.dto'
import { ClientsMapper } from './clients.mapper'
import { ClientsPolicy } from './clients.policy'
import { ClientsService } from './clients.service'
import { AddClientAliasRequestDto } from './dtos/add-client-alias-request.dto'
import { GetClientResponseDto } from './dtos/get-client-response.dto'
import { GetClientsQueryDto } from './dtos/get-clients-query.dto'
import { UpdateClientCodeRequestDto } from './dtos/update-client-code-request.dto'

const CLIENT_ID_PARAM = 'clientId'

function formattedClientCodeSql(column: string): string {
  const digits = `CAST(ABS(CAST(${column} AS bigint)) AS text)`
  return `(CASE WHEN ${column} < 0 THEN '-' ELSE '' END || LPAD(${digits}, GREATEST(3, LENGTH(${digits})), '0'))`
}

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
            code: Raw(
              (alias) => `${formattedClientCodeSql(alias)} ILIKE :search`,
              {
                search: `%${search}%`,
              }
            ),
          },
          {
            id: Raw(
              (alias) =>
                `EXISTS (SELECT 1 FROM "client_code_alias" "codeAlias" WHERE "codeAlias"."clientId" = ${alias} AND ${formattedClientCodeSql('"codeAlias"."code"')} ILIKE :search)`,
              { search: `%${search}%` }
            ),
          },
          { legacyPhoneRaw: ILike(`%${search}%`) },
          { user: { name: ILike(`%${search}%`) } },
          { user: { phoneNumber: ILike(`%${search}%`) } },
        ]
      : undefined

    const clients = await this.clientsService.find({
      where,
      relations: { user: true },
      order: { code: 'ASC' },
      take: limit,
      skip: offset,
    })
    const aliasesByClientId = await this.clientsService.findAliasesByClientIds(
      clients.map((client) => client.id)
    )

    return clients.map((client) =>
      ClientsMapper.toGetClientResponseDto(
        client,
        aliasesByClientId.get(client.id) ?? []
      )
    )
  }

  @Patch(`:${CLIENT_ID_PARAM}/code`)
  async updateClientCode(
    @Param(CLIENT_ID_PARAM, ParseUUIDPipe) clientId: string,
    @Body() body: UpdateClientCodeRequestDto
  ): Promise<SuccessResponseDto> {
    this.clientsPolicy.checkCanManageCodes()
    await this.clientsService.updateCode(clientId, body.code, body.expectedCode)
    return new SuccessResponseDto()
  }

  @Post(`:${CLIENT_ID_PARAM}/aliases`)
  async addClientAlias(
    @Param(CLIENT_ID_PARAM, ParseUUIDPipe) clientId: string,
    @Body() body: AddClientAliasRequestDto
  ): Promise<SuccessResponseDto> {
    this.clientsPolicy.checkCanManageCodes()
    await this.clientsService.addAlias(clientId, body.code)
    return new SuccessResponseDto()
  }

  @Delete(`:${CLIENT_ID_PARAM}/aliases/:code`)
  async removeClientAlias(
    @Param(CLIENT_ID_PARAM, ParseUUIDPipe) clientId: string,
    @Param('code', ParseIntPipe) code: number
  ): Promise<SuccessResponseDto> {
    this.clientsPolicy.checkCanManageCodes()
    await this.clientsService.removeAlias(clientId, code)
    return new SuccessResponseDto()
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
    const aliasesByClientId = await this.clientsService.findAliasesByClientIds([
      client.id,
    ])

    return ClientsMapper.toGetClientResponseDto(
      client,
      aliasesByClientId.get(client.id) ?? []
    )
  }
}
