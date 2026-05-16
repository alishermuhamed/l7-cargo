import { ApiProperty } from '@nestjs/swagger'
import { IsBooleanString, IsIn, IsOptional } from 'class-validator'

import { PARCEL_STATUSES, type ParcelStatus } from '../../parcels/parcel-status'

export class CreateParcelsImportRequestDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
  })
  file!: Express.Multer.File

  @IsOptional()
  @IsBooleanString()
  withHeader: string = 'true'

  @ApiProperty({
    enum: PARCEL_STATUSES,
    enumName: 'ParcelStatus',
  })
  @IsIn(PARCEL_STATUSES)
  parcelStatus!: ParcelStatus
}
