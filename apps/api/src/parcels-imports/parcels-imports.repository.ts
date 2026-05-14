import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm'

import { ContextService } from '../context/context.service'
import { BaseRepository } from '../db/base.repository'
import { ParcelsImport } from './entities/parcels-import.entity'

@Injectable()
export class ParcelsImportsRepository extends BaseRepository<ParcelsImport> {
  constructor(
    protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    protected readonly contextService: ContextService
  ) {
    super(txHost, contextService, ParcelsImport)
  }
}
