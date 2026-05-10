import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ILike } from 'typeorm'

import { SuccessResponseDto } from '../common/dtos/success-response.dto'
import { ContextService } from '../context/context.service'
import { CreateParcelRequestDto } from './dtos/create-parcel-request.dto'
import { CreateParcelResponseDto } from './dtos/create-parcel-response.dto'
import { GetParcelResponseDto } from './dtos/get-parcel-response.dto'
import { GetParcelStatusHistoryResponseDto } from './dtos/get-parcel-status-history-response.dto'
import { GetParcelsQueryDto } from './dtos/get-parcels-query.dto'
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
    private readonly parcelsPolicy: ParcelsPolicy,
    private readonly contextService: ContextService,
    private readonly parcelsService: ParcelsService,
    private readonly parcelStatusHistoryService: ParcelStatusHistoryService
  ) {}

  @Post()
  async createParcel(
    @Body() { trackingNumber, source, description }: CreateParcelRequestDto
  ): Promise<CreateParcelResponseDto> {
    this.parcelsPolicy.checkCanCreate()

    const userId = this.contextService.getUserIdOrThrow()

    const id = await this.parcelsService.create({
      userId,
      trackingNumber,
      source,
      description,
    })

    return { id }
  }

  @Get()
  async getParcels(
    @Query() { search, status, userId, limit, offset }: GetParcelsQueryDto
  ): Promise<GetParcelResponseDto[]> {
    const policyWhere = this.parcelsPolicy.getFindOptionsWhere()

    const baseWhere = { status, userId, ...policyWhere }

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

  @Patch(`:${PARCEL_ID_PARAM}`)
  async updateParcel(
    @Param(PARCEL_ID_PARAM, ParseUUIDPipe) parcelId: string,
    @Body() updateParcelRequestDto: UpdateParcelRequestDto
  ): Promise<SuccessResponseDto> {
    await this.parcelsPolicy.checkCanUpdate(parcelId, updateParcelRequestDto)

    const { source, description, weightKg, deliveryFee } =
      updateParcelRequestDto

    await this.parcelsService.update(parcelId, {
      source,
      description,
      weightKg,
      deliveryFee,
    })

    return new SuccessResponseDto()
  }

  @Delete(`:${PARCEL_ID_PARAM}`)
  async deleteParcel(
    @Param(PARCEL_ID_PARAM, ParseUUIDPipe) parcelId: string
  ): Promise<SuccessResponseDto> {
    await this.parcelsPolicy.checkCanDelete(parcelId)

    await this.parcelsService.delete(parcelId)

    return new SuccessResponseDto()
  }
}
