import { Check, Entity, Index, ManyToOne } from 'typeorm'

import { BaseEntity } from '../../db/base.entity'
import { IntegerColumn } from '../../db/columns/integer-column'
import { UUIDColumn } from '../../db/columns/uuid-column'
import { Client } from './client.entity'

@Check('"code" > 0')
@Entity()
export class LegacyClientCodeAlias extends BaseEntity {
  @Index({ unique: true })
  @IntegerColumn()
  code!: number

  @Index()
  @UUIDColumn()
  clientId!: string

  @ManyToOne(() => Client, { nullable: false, onDelete: 'RESTRICT' })
  client?: Client
}
