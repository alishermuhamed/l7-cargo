import { Entity, Index, ManyToOne } from 'typeorm'

import { BaseEntity } from '../../db/base.entity'
import { DateColumn } from '../../db/columns/date-column'
import { TextColumn } from '../../db/columns/text-column'
import { UUIDColumn } from '../../db/columns/uuid-column'
import type { ParcelStatus } from '../parcel-status'
import { Parcel } from './parcel.entity'

@Index(['parcelId', 'createdAt'])
@Entity()
export class ParcelStatusHistory extends BaseEntity {
  @UUIDColumn()
  parcelId!: string

  @ManyToOne(() => Parcel, { nullable: false, onDelete: 'CASCADE' })
  parcel?: Parcel

  @TextColumn()
  status!: ParcelStatus

  @DateColumn()
  achievedAt!: string
}
