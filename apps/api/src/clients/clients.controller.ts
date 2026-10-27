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

import { SuccessResponseDto } from '../common/dtos/success-response.dto'
import { ClientsMapper } from './clients.mapper'
import { ClientsPolicy } from './clients.policy'
import { ClientsService } from './clients.service'
import { AddClientAliasRequestDto } from './dtos/add-client-alias-request.dto'
import { GetClientResponseDto } from './dtos/get-client-response.dto'
import { GetClientsQueryDto } from './dtos/get-clients-query.dto'
import { UpdateClientCodeRequestDto } from './dtos/update-client-code-request.dto'

const CLIENT_ID_PARAM = 'clientId'
const CODE_PARAM = 'code'

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

    const clients = await this.clientsService.getClients({
      search,
      limit,
      offset,
    })

    return clients.map((client) => ClientsMapper.toGetClientResponseDto(client))
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

  @Delete(`:${CLIENT_ID_PARAM}/aliases/:${CODE_PARAM}`)
  async removeClientAlias(
    @Param(CLIENT_ID_PARAM, ParseUUIDPipe) clientId: string,
    @Param(CODE_PARAM, ParseIntPipe) code: number
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

    const client = await this.clientsService.getClient(clientId)

    return ClientsMapper.toGetClientResponseDto(client)
  }
}
