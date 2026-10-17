import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm'
import { In } from 'typeorm'

import { ContextService } from '../context/context.service'
import { BaseRepository } from '../db/base.repository'
import { LegacyClientCodeAlias } from './entities/legacy-client-code-alias.entity'

@Injectable()
export class LegacyClientCodeAliasRepository extends BaseRepository<LegacyClientCodeAlias> {
  constructor(
    protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    protected readonly contextService: ContextService
  ) {
    super(txHost, contextService, LegacyClientCodeAlias)
  }

  async findByClientIds(clientIds: string[]): Promise<LegacyClientCodeAlias[]> {
    if (clientIds.length === 0) {
      return []
    }

    return this.find({ where: { clientId: In(clientIds) } })
  }
}
