import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsISO8601,
  Matches,
  ValidateNested,
} from 'class-validator'

import { PARCEL_STATUSES, type ParcelStatus } from '../parcel-status'

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export class PutParcelStatusHistoryEntryRequestDto {
  @ApiProperty({
    enum: PARCEL_STATUSES,
    enumName: 'ParcelStatus',
  })
  @IsIn(PARCEL_STATUSES)
  status!: ParcelStatus

  @ApiProperty({ type: 'string', format: 'date' })
  @Matches(DATE_ONLY_PATTERN)
  @IsISO8601({ strict: true })
  achievedAt!: string
}

export class PutParcelStatusHistoryRequestDto {
  @Type(() => PutParcelStatusHistoryEntryRequestDto)
  @IsArray()
  @ArrayMaxSize(PARCEL_STATUSES.length)
  @ArrayUnique((entry: PutParcelStatusHistoryEntryRequestDto) => entry.status)
  @ValidateNested({ each: true })
  entries!: PutParcelStatusHistoryEntryRequestDto[]
}
