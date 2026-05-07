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
import { GetParcelsQueryDto } from './dtos/get-parcels-query.dto'
import { UpdateParcelRequestDto } from './dtos/update-parcel-request.dto'
import { ParcelsMapper } from './parcels.mapper'
import { ParcelsPolicy } from './parcels.policy'
import { ParcelsService } from './parcels.service'

const PARCEL_ID_PARAM = 'parcelId'

@Controller('parcels')
export class ParcelsController {
  constructor(
    private readonly parcelsPolicy: ParcelsPolicy,
    private readonly contextService: ContextService,
    private readonly parcelsService: ParcelsService
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
    @Query() { search, status }: GetParcelsQueryDto
  ): Promise<GetParcelResponseDto[]> {
    const policyWhere = this.parcelsPolicy.getFindOptionsWhere()

    const where = search
      ? [
          {
            status,
            trackingNumber: ILike(`%${search}%`),
            ...policyWhere,
          },
          {
            status,
            description: ILike(`%${search}%`),
            ...policyWhere,
          },
        ]
      : { status, ...policyWhere }

    const parcels = await this.parcelsService.find({ where })

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

  @Patch(`:${PARCEL_ID_PARAM}`)
  async updateParcel(
    @Param(PARCEL_ID_PARAM, ParseUUIDPipe) parcelId: string,
    @Body() updateParcelRequestDto: UpdateParcelRequestDto
  ): Promise<SuccessResponseDto> {
    await this.parcelsPolicy.checkCanUpdate(parcelId, updateParcelRequestDto)

    const { source, description } = updateParcelRequestDto

    await this.parcelsService.update(parcelId, {
      source,
      description,
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
