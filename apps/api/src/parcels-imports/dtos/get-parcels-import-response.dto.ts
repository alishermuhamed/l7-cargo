import type { ParcelStatus } from '../../parcels/parcel-status'
import type { ParsedParcelsImportData } from '../entities/parcels-import.entity'

export class GetParcelsImportResponseDto {
  id!: string
  isCommitted!: boolean
  parcelStatus!: ParcelStatus
  committedAt!: string | null
  parsedData!: ParsedParcelsImportData
}
