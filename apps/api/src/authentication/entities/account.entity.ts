import { Entity, ManyToOne } from 'typeorm'

import { BaseEntity } from '../../db/base.entity'
import { DateColumn } from '../../db/columns/date-column'
import { TextColumn } from '../../db/columns/text-column'
import { UUIDColumn } from '../../db/columns/uuid-column'
import { User } from '../../users/entities/user.entity'

@Entity()
export class Account extends BaseEntity {
  @TextColumn()
  accountId!: string

  @TextColumn()
  providerId!: string

  @TextColumn({ nullable: true })
  accessToken!: string | null

  @TextColumn({ nullable: true })
  refreshToken!: string | null

  @DateColumn({ nullable: true })
  accessTokenExpiresAt!: Date | null

  @DateColumn({ nullable: true })
  refreshTokenExpiresAt!: Date | null

  @TextColumn({ nullable: true })
  scope!: string | null

  @TextColumn({ nullable: true })
  idToken!: string | null

  @TextColumn({ nullable: true })
  password!: string | null

  @UUIDColumn()
  userId!: string

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user?: User
}
