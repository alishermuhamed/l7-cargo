import { ApiProperty } from '@nestjs/swagger'

import { PARCEL_STATUSES, type ParcelStatus } from '../../parcels/parcel-status'
import {
  PARSE_ERROR_CODES,
  PARSE_WARNING_CODES,
} from '../entities/parcels-import.entity'

class ParsedParcelsImportRowDto {
  rowNumber!: number
  clientCode?: number
  trackingNumber!: string
  weightKg?: number
  deliveryFee?: number
  comments?: string
}

class ParsedParcelsImportWarningDto {
  rowNumber!: number

  @ApiProperty({
    enum: PARSE_WARNING_CODES,
    enumName: 'ParcelsImportWarningCode',
  })
  code!: (typeof PARSE_WARNING_CODES)[number]
}

class ParsedParcelsImportErrorDto {
  rowNumber!: number

  @ApiProperty({
    enum: PARSE_ERROR_CODES,
    enumName: 'ParcelsImportErrorCode',
  })
  code!: (typeof PARSE_ERROR_CODES)[number]
}

class ParsedParcelsImportDataDto {
  rows!: ParsedParcelsImportRowDto[]
  warnings!: ParsedParcelsImportWarningDto[]
  errors!: ParsedParcelsImportErrorDto[]
}

export class GetParcelsImportResponseDto {
  id!: string
  isCommitted!: boolean

  @ApiProperty({
    enum: PARCEL_STATUSES,
    enumName: 'ParcelStatus',
  })
  parcelStatus!: ParcelStatus
  achievedAt!: string
  committedAt!: string | null
  parsedData!: ParsedParcelsImportDataDto
}
