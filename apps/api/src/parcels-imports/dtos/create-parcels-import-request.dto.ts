import { ApiProperty } from '@nestjs/swagger'
import {
  IsBooleanString,
  IsIn,
  IsISO8601,
  IsOptional,
  Matches,
} from 'class-validator'

import { PARCEL_STATUSES, type ParcelStatus } from '../../parcels/parcel-status'

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

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

  @ApiProperty({ type: 'string', format: 'date' })
  @Matches(DATE_ONLY_PATTERN)
  @IsISO8601({ strict: true })
  achievedAt!: string
}
