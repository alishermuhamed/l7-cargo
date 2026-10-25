import { Entity, Index, OneToOne } from 'typeorm'

import { BaseEntity } from '../../db/base.entity'
import { IntegerColumn } from '../../db/columns/integer-column'
import { TextColumn } from '../../db/columns/text-column'
import { User } from '../../users/entities/user.entity'

@Entity()
export class Client extends BaseEntity {
  @Index({ unique: true })
  @IntegerColumn()
  code!: number

  @TextColumn({ nullable: true })
  legacyPhoneRaw!: string | null

  @Index({ unique: true })
  @TextColumn({ nullable: true })
  legacyPhoneNormalized!: string | null

  @OneToOne(() => User, (user) => user.client)
  user?: User | null
}
