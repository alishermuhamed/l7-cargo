import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString } from 'class-validator'

import { PARCEL_STATUSES, type ParcelStatus } from '../parcel-status'

export class GetParcelsQueryDto {
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: PARCEL_STATUSES, enumName: 'ParcelStatus' })
  @IsOptional()
  @IsIn(PARCEL_STATUSES)
  status?: ParcelStatus
}
