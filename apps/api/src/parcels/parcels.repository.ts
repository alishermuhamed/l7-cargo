import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm'
import { In } from 'typeorm'

import { ContextService } from '../context/context.service'
import { BaseRepository } from '../db/base.repository'
import { Parcel } from './entities/parcel.entity'

@Injectable()
export class ParcelsRepository extends BaseRepository<Parcel> {
  async lockForClientMerge(clientIds: string[]): Promise<void> {
    await this.repository.find({
      where: { clientId: In(clientIds) },
      select: { id: true },
      order: { id: 'ASC' },
      lock: { mode: 'pessimistic_write' },
    })
  }

  async countByClient(clientId: string): Promise<number> {
    return this.repository.countBy({ clientId })
  }

  constructor(
    protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    protected readonly contextService: ContextService
  ) {
    super(txHost, contextService, Parcel)
  }
}
