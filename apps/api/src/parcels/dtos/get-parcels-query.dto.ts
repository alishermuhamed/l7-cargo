import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator'

import { PaginationParamsDto } from '../../common/dtos/pagination-params.dto'
import { PARCEL_STATUSES, type ParcelStatus } from '../parcel-status'

export class GetParcelsQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsUUID()
  userId?: string

  @ApiPropertyOptional({ enum: PARCEL_STATUSES, enumName: 'ParcelStatus' })
  @IsOptional()
  @IsIn(PARCEL_STATUSES)
  status?: ParcelStatus
}
