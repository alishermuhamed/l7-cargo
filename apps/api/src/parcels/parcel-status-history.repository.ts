import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm'

import { ContextService } from '../context/context.service'
import { BaseRepository } from '../db/base.repository'
import { ParcelStatusHistory } from './entities/parcel-status-history.entity'

@Injectable()
export class ParcelStatusHistoryRepository extends BaseRepository<ParcelStatusHistory> {
  constructor(
    protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    protected readonly contextService: ContextService
  ) {
    super(txHost, contextService, ParcelStatusHistory)
  }
}
