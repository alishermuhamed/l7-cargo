import { ApiProperty } from '@nestjs/swagger'

import { PARCEL_STATUSES, type ParcelStatus } from '../parcel-status'

export class GetParcelStatusHistoryResponseDto {
  id!: string
  parcelId!: string
  createdAt!: string
  achievedAt!: string

  @ApiProperty({
    enum: PARCEL_STATUSES,
    enumName: 'ParcelStatus',
  })
  status!: ParcelStatus
}
