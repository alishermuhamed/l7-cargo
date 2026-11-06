import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm'

import { ContextService } from '../context/context.service'
import { BaseRepository } from '../db/base.repository'
import { Session } from './entities/session.entity'

@Injectable()
export class SessionsRepository extends BaseRepository<Session> {
  constructor(
    protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    protected readonly contextService: ContextService
  ) {
    super(txHost, contextService, Session)
  }
}
