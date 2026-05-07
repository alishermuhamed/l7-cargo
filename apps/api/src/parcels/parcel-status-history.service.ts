import { Injectable } from '@nestjs/common'
import { FindManyOptions, FindOptionsRelations } from 'typeorm'

import { WithRelations } from '../db/db.types'
import { ParcelStatusHistory } from './entities/parcel-status-history.entity'
import { ParcelStatusHistoryRepository } from './parcel-status-history.repository'

@Injectable()
export class ParcelStatusHistoryService {
  constructor(
    private readonly parcelStatusHistoryRepository: ParcelStatusHistoryRepository
  ) {}

  async find<R extends FindOptionsRelations<ParcelStatusHistory>>(
    options?: Omit<FindManyOptions<ParcelStatusHistory>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<ParcelStatusHistory, R>[]> {
    return this.parcelStatusHistoryRepository.find(options)
  }
}
