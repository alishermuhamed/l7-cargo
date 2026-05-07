import { ApiProperty } from '@nestjs/swagger'

import { PARCEL_STATUSES, type ParcelStatus } from '../parcel-status'

export class GetParcelResponseDto {
  id!: string
  createdAt!: Date
  updatedAt!: Date
  trackingNumber!: string
  userId!: string | null

  @ApiProperty({
    enum: PARCEL_STATUSES,
    enumName: 'ParcelStatus',
    nullable: true,
  })
  status!: ParcelStatus | null

  source!: string | null
  description!: string | null
  weightKg!: string | null
  deliveryFee!: string | null
  notes!: string | null
}
