import { Entity, Index, JoinColumn, OneToOne } from 'typeorm'

import { Client } from '../../clients/entities/client.entity'
import { BaseEntity } from '../../db/base.entity'
import { BooleanColumn } from '../../db/columns/boolean-column'
import { TextColumn } from '../../db/columns/text-column'
import { UUIDColumn } from '../../db/columns/uuid-column'
import { DEFAULT_USER_ROLE, type UserRole } from '../user-role'

@Entity()
export class User extends BaseEntity {
  @UUIDColumn()
  clientId!: string

  @OneToOne(() => Client, (client) => client.user, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  client?: Client

  @TextColumn()
  name!: string

  @Index({ unique: true })
  @TextColumn()
  email!: string

  @BooleanColumn({ default: false })
  emailVerified!: boolean

  @TextColumn({ nullable: true })
  image!: string | null

  @TextColumn({ nullable: true })
  phoneNumber!: string | null

  @BooleanColumn({ nullable: true })
  phoneNumberVerified!: boolean | null

  @TextColumn({ default: DEFAULT_USER_ROLE })
  role!: UserRole
}
