import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm'
import { IsNull, Not } from 'typeorm'

import { ContextService } from '../context/context.service'
import { BaseRepository } from '../db/base.repository'
import { Account } from './entities/account.entity'

@Injectable()
export class AccountsRepository extends BaseRepository<Account> {
  constructor(
    protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    protected readonly contextService: ContextService
  ) {
    super(txHost, contextService, Account)
  }

  async hasPasswordForPhoneNumber(phoneNumber: string): Promise<boolean> {
    return this.repository.exists({
      where: {
        providerId: 'credential',
        password: Not(IsNull()),
        user: { phoneNumber },
      },
    })
  }
}
