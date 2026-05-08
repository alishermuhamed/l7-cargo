import { Entity, Index } from 'typeorm'

import { BaseEntity } from '../../db/base.entity'
import { BooleanColumn } from '../../db/columns/boolean-column'
import { TextColumn } from '../../db/columns/text-column'
import { DEFAULT_USER_ROLE, type UserRole } from '../user-role'

@Entity()
export class User extends BaseEntity {
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
