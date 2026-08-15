import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm'

import { ContextService } from '../context/context.service'
import { BaseRepository } from '../db/base.repository'
import { Client } from './entities/client.entity'

const CLIENT_CODE_ALLOCATION_LOCK_ID = 7182

@Injectable()
export class ClientsRepository extends BaseRepository<Client> {
  constructor(
    protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    protected readonly contextService: ContextService
  ) {
    super(txHost, contextService, Client)
  }

  async lockCodeAllocation(): Promise<void> {
    await this.manager.query('SELECT pg_advisory_xact_lock($1)', [
      CLIENT_CODE_ALLOCATION_LOCK_ID,
    ])
  }

  async getNextCode(): Promise<number> {
    const results: unknown = await this.manager.query(`
      SELECT (COALESCE(MAX("code"), 0) + 1)::integer AS "code"
      FROM "client"
    `)

    const firstResult: unknown = Array.isArray(results) ? results[0] : undefined

    if (
      typeof firstResult !== 'object' ||
      firstResult === null ||
      !('code' in firstResult) ||
      typeof firstResult.code !== 'number'
    ) {
      throw new Error('Invalid next client code result')
    }

    return firstResult.code
  }
}
