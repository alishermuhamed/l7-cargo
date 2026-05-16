import { ApiProperty } from '@nestjs/swagger'

import { PARCEL_STATUSES, type ParcelStatus } from '../../parcels/parcel-status'

export class GetParcelsImportSummaryResponseDto {
  id!: string
  createdAt!: string

  @ApiProperty({
    enum: PARCEL_STATUSES,
    enumName: 'ParcelStatus',
  })
  parcelStatus!: ParcelStatus

  isCommitted!: boolean
  committedAt!: string | null
}
