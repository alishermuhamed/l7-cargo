import { Entity, Index, ManyToOne } from 'typeorm'

import { BaseEntity } from '../../db/base.entity'
import { DecimalColumn, MoneyColumn } from '../../db/columns/decimal-column'
import { TextColumn } from '../../db/columns/text-column'
import { UUIDColumn } from '../../db/columns/uuid-column'
import { User } from '../../users/entities/user.entity'
import type { ParcelStatus } from '../parcel-status'

@Entity()
export class Parcel extends BaseEntity {
  @Index({ unique: true })
  @TextColumn()
  trackingNumber!: string

  @Index()
  @UUIDColumn({ nullable: true })
  userId!: string | null

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user?: User | null

  @TextColumn({ nullable: true })
  status!: ParcelStatus | null

  @TextColumn({ nullable: true })
  source!: string | null

  @TextColumn({ nullable: true })
  description!: string | null

  @DecimalColumn({ nullable: true, precision: 7, scale: 3 })
  weightKg!: string | null

  @MoneyColumn({ nullable: true })
  deliveryFee!: string | null

  @TextColumn({ nullable: true })
  notes!: string | null
}
