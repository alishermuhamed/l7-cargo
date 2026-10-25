import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ILike } from 'typeorm'

import { ClientsService } from '../clients/clients.service'
import { SuccessResponseDto } from '../common/dtos/success-response.dto'
import { ContextService } from '../context/context.service'
import { CreateParcelRequestDto } from './dtos/create-parcel-request.dto'
import { CreateParcelResponseDto } from './dtos/create-parcel-response.dto'
import { GetParcelResponseDto } from './dtos/get-parcel-response.dto'
import { GetParcelStatusHistoryResponseDto } from './dtos/get-parcel-status-history-response.dto'
import { GetParcelsQueryDto } from './dtos/get-parcels-query.dto'
import { GetReadyForPickupBalanceResponseDto } from './dtos/get-ready-for-pickup-balance-response.dto'
import { PutParcelStatusHistoryRequestDto } from './dtos/put-parcel-status-history-request.dto'
import { UpdateParcelRequestDto } from './dtos/update-parcel-request.dto'
import { ParcelStatusHistoryMapper } from './parcel-status-history.mapper'
import { ParcelStatusHistoryService } from './parcel-status-history.service'
import { ParcelsMapper } from './parcels.mapper'
import { ParcelsPolicy } from './parcels.policy'
import { ParcelsService } from './parcels.service'

const PARCEL_ID_PARAM = 'parcelId'

@Controller('parcels')
export class ParcelsController {
  constructor(
    private readonly contextService: ContextService,
    private readonly clientsService: ClientsService,
    private readonly parcelsPolicy: ParcelsPolicy,
    private readonly parcelsService: ParcelsService,
    private readonly parcelStatusHistoryService: ParcelStatusHistoryService
  ) {}

  @Post()
  async createParcel(
    @Body() createParcelRequestDto: CreateParcelRequestDto
  ): Promise<CreateParcelResponseDto> {
    this.parcelsPolicy.checkCanCreate(createParcelRequestDto)

    const user = this.contextService.getUserOrThrow()

    const {
      clientCode,
      trackingNumber,
      source,
      description,
      weightKg,
      deliveryFee,
      comments,
    } = createParcelRequestDto

    let clientId: string | null

    if (user.role === 'client') {
      clientId = user.clientId
    } else {
      if (clientCode !== undefined) {
        clientId = (await this.clientsService.findOrCreateByCode(clientCode)).id
      } else {
        clientId = null
      }
    }

    const id = await this.parcelsService.create({
      clientId,
      trackingNumber,
      source,
      description,
      weightKg,
      deliveryFee,
      comments,
    })

    return ParcelsMapper.toCreateParcelResponseDto(id)
  }

  @Get()
  async getParcels(
    @Query() { search, status, clientId, limit, offset }: GetParcelsQueryDto
  ): Promise<GetParcelResponseDto[]> {
    const policyWhere = this.parcelsPolicy.getFindOptionsWhere()

    const baseWhere = { status, clientId, ...policyWhere }

    const where = search
      ? [
          {
            trackingNumber: ILike(`%${search}%`),
            ...baseWhere,
          },
          {
            description: ILike(`%${search}%`),
            ...baseWhere,
          },
        ]
      : baseWhere

    const parcels = await this.parcelsService.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    })

    return parcels.map((p) => ParcelsMapper.toGetParcelResponseDto(p))
  }

  @Get('ready-for-pickup-balance')
  async getReadyForPickupBalance(): Promise<GetReadyForPickupBalanceResponseDto> {
    this.parcelsPolicy.checkCanReadReadyForPickupBalance()

    const user = this.contextService.getUserOrThrow()
    const totalDeliveryFee = await this.parcelsService.getReadyForPickupBalance(
      user.clientId
    )

    return { totalDeliveryFee }
  }

  @Get(`:${PARCEL_ID_PARAM}`)
  async getParcel(
    @Param(PARCEL_ID_PARAM, ParseUUIDPipe) parcelId: string
  ): Promise<GetParcelResponseDto> {
    const policyWhere = this.parcelsPolicy.getFindOptionsWhere()

    const parcel = await this.parcelsService.findOneOrThrow({
      where: { id: parcelId, ...policyWhere },
    })

    return ParcelsMapper.toGetParcelResponseDto(parcel)
  }

  @Get(`:${PARCEL_ID_PARAM}/status-history`)
  async getParcelStatusHistory(
    @Param(PARCEL_ID_PARAM, ParseUUIDPipe) parcelId: string
  ): Promise<GetParcelStatusHistoryResponseDto[]> {
    await this.parcelsPolicy.checkCanRead(parcelId)

    const statusHistory = await this.parcelStatusHistoryService.find({
      where: { parcelId },
      order: { createdAt: 'ASC' },
    })

    return statusHistory.map((history) =>
      ParcelStatusHistoryMapper.toGetParcelStatusHistoryResponseDto(history)
    )
  }

  @Put(`:${PARCEL_ID_PARAM}/status-history`)
  async putParcelStatusHistory(
    @Param(PARCEL_ID_PARAM, ParseUUIDPipe) parcelId: string,
    @Body() { entries }: PutParcelStatusHistoryRequestDto
  ): Promise<SuccessResponseDto> {
    this.parcelsPolicy.checkCanManageStatusHistory()

    await this.parcelStatusHistoryService.replace(parcelId, entries)

    return new SuccessResponseDto()
  }

  @Patch(`:${PARCEL_ID_PARAM}`)
  async updateParcel(
    @Param(PARCEL_ID_PARAM, ParseUUIDPipe) parcelId: string,
    @Body() updateParcelRequestDto: UpdateParcelRequestDto
  ): Promise<SuccessResponseDto> {
    await this.parcelsPolicy.checkCanUpdate(parcelId, updateParcelRequestDto)

    const { clientCode, source, description, weightKg, deliveryFee, comments } =
      updateParcelRequestDto

    await this.parcelsService.update(parcelId, {
      clientCode,
      source,
      description,
      weightKg,
      deliveryFee,
      comments,
    })

    return new SuccessResponseDto()
  }

  @Delete(`:${PARCEL_ID_PARAM}`)
  async deleteParcel(
    @Param(PARCEL_ID_PARAM, ParseUUIDPipe) parcelId: string
  ): Promise<SuccessResponseDto> {
    await this.parcelsPolicy.checkCanDelete(parcelId)

    const user = this.contextService.getUserOrThrow()

    if (user.role === 'admin') {
      await this.parcelsService.delete(parcelId)
    } else {
      await this.parcelsService.hideFromClient(parcelId)
    }

    return new SuccessResponseDto()
  }
}
