import { Entity } from 'typeorm'

import { BaseEntity } from '../../db/base.entity'
import { DateTimeColumn } from '../../db/columns/date-time-column'
import { TextColumn } from '../../db/columns/text-column'

@Entity()
export class Verification extends BaseEntity {
  @TextColumn()
  identifier!: string

  @TextColumn()
  value!: string

  @DateTimeColumn()
  expiresAt!: Date
}
