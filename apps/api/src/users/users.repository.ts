import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm'

import { ContextService } from '../context/context.service'
import { BaseRepository } from '../db/base.repository'
import type { CreateInput } from '../db/db.types'
import { User } from './entities/user.entity'

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    protected readonly contextService: ContextService
  ) {
    super(txHost, contextService, User)
  }

  create(_: CreateInput<User>): User {
    throw new Error('Users can only be created via AuthenticationModule')
  }
}
