import { Injectable } from '@nestjs/common'
import { FindManyOptions, FindOptionsRelations } from 'typeorm'

import { WithRelations } from '../db/db.types'
import { ParcelStatusHistory } from './entities/parcel-status-history.entity'
import type { ParcelStatus } from './parcel-status'
import { ParcelStatusHistoryRepository } from './parcel-status-history.repository'

@Injectable()
export class ParcelStatusHistoryService {
  constructor(
    private readonly parcelStatusHistoryRepository: ParcelStatusHistoryRepository
  ) {}

  async create({
    parcelId,
    status,
    achievedAt,
  }: {
    parcelId: string
    status: ParcelStatus
    achievedAt: string
  }): Promise<ParcelStatusHistory['id']> {
    const history = this.parcelStatusHistoryRepository.create({
      parcelId,
      status,
      achievedAt,
    })

    await this.parcelStatusHistoryRepository.insert(history)

    return history.id
  }

  async find<R extends FindOptionsRelations<ParcelStatusHistory>>(
    options?: Omit<FindManyOptions<ParcelStatusHistory>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<ParcelStatusHistory, R>[]> {
    return this.parcelStatusHistoryRepository.find(options)
  }
}
