import { Entity } from 'typeorm'

import { BaseEntity } from '../../db/base.entity'
import { BooleanColumn } from '../../db/columns/boolean-column'
import { DateColumn } from '../../db/columns/date-column'
import { DateTimeColumn } from '../../db/columns/date-time-column'
import { JsonbColumn } from '../../db/columns/jsonb-column'
import { TextColumn } from '../../db/columns/text-column'
import type { ParcelStatus } from '../../parcels/parcel-status'

export interface ParsedParcelsImportRow {
  rowNumber: number
  clientCode?: number
  trackingNumber: string
  weightKg?: number
  deliveryFee?: number
  comments?: string
}

export const PARSE_WARNING_CODES = [
  'PARCEL_CLIENT_MISMATCH',
  'UNKNOWN_CLIENT',
] as const

export type ParseWarningCode = (typeof PARSE_WARNING_CODES)[number]

export interface ParsedParcelsImportWarning {
  rowNumber: number
  code: ParseWarningCode
}

export const PARSE_ERROR_CODES = [
  'CLIENT_CODE_REQUIRED',
  'INVALID_CLIENT_ID',
  'INVALID_TRACKING_CODE',
  'INVALID_WEIGHT_KG',
  'INVALID_DELIVERY_FEE',
  'INVALID_COMMENTS',
  'UNKNOWN',
] as const

export type ParseErrorCode = (typeof PARSE_ERROR_CODES)[number]

export interface ParsedParcelsImportError {
  rowNumber: number
  code: ParseErrorCode
}

export interface ParsedParcelsImportData {
  rows: ParsedParcelsImportRow[]
  warnings: ParsedParcelsImportWarning[]
  errors: ParsedParcelsImportError[]
}

@Entity()
export class ParcelsImport extends BaseEntity {
  @BooleanColumn({ default: false })
  isCommitted!: boolean

  @TextColumn()
  parcelStatus!: ParcelStatus

  @DateColumn()
  achievedAt!: string

  @DateTimeColumn({ nullable: true })
  committedAt!: Date | null

  @JsonbColumn()
  parsedData!: ParsedParcelsImportData
}
