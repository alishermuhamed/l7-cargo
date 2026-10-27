import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm'
import { ILike, Raw } from 'typeorm'

import { ContextService } from '../context/context.service'
import { BaseRepository } from '../db/base.repository'
import { WithRelations } from '../db/db.types'
import { GetClientsOptions } from './clients.types'
import { Client } from './entities/client.entity'

const CLIENT_CODE_ALLOCATION_LOCK_ID = 7182

function formattedClientCodeSql(column: string): string {
  const digits = `CAST(ABS(CAST(${column} AS bigint)) AS text)`
  return `(CASE WHEN ${column} < 0 THEN '-' ELSE '' END || LPAD(${digits}, GREATEST(3, LENGTH(${digits})), '0'))`
}

@Injectable()
export class ClientsRepository extends BaseRepository<Client> {
  constructor(
    protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    protected readonly contextService: ContextService
  ) {
    super(txHost, contextService, Client)
  }

  async getClients({
    search,
    limit,
    offset,
  }: GetClientsOptions): Promise<
    WithRelations<Client, { user: true; codeAliases: true }>[]
  > {
    const where = search
      ? [
          {
            code: Raw(
              (alias) => `${formattedClientCodeSql(alias)} ILIKE :search`,
              {
                search: `%${search}%`,
              }
            ),
          },
          {
            id: Raw(
              (alias) =>
                `EXISTS (SELECT 1 FROM "client_code_alias" "codeAlias" WHERE "codeAlias"."clientId" = ${alias} AND ${formattedClientCodeSql('"codeAlias"."code"')} ILIKE :search)`,
              { search: `%${search}%` }
            ),
          },
          { legacyPhoneRaw: ILike(`%${search}%`) },
          { user: { name: ILike(`%${search}%`) } },
          { user: { phoneNumber: ILike(`%${search}%`) } },
        ]
      : undefined

    return this.find({
      where,
      relations: { user: true, codeAliases: true },
      order: { createdAt: 'DESC', id: 'DESC' },
      take: limit,
      skip: offset,
    })
  }

  async lockCodeAllocation(): Promise<void> {
    await this.manager.query('SELECT pg_advisory_xact_lock($1)', [
      CLIENT_CODE_ALLOCATION_LOCK_ID,
    ])
  }

  async getNextCode(): Promise<number> {
    const results: unknown = await this.manager.query(`
      SELECT (
        GREATEST(
          COALESCE((SELECT MAX("code") FROM "client"), 0),
          COALESCE((SELECT MAX("code") FROM "client_code_alias"), 0)
        ) + 1
      )::integer AS "code"
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
