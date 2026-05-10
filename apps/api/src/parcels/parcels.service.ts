import { Injectable } from '@nestjs/common'
import { FindManyOptions, FindOneOptions, FindOptionsRelations } from 'typeorm'

import { WithRelations } from '../db/db.types'
import { Parcel } from './entities/parcel.entity'
import { ParcelsRepository } from './parcels.repository'

@Injectable()
export class ParcelsService {
  constructor(private readonly parcelsRepository: ParcelsRepository) {}

  async create({
    userId,
    trackingNumber,
    source,
    description,
  }: {
    userId: string
    trackingNumber: string
    source?: string
    description?: string
  }): Promise<Parcel['id']> {
    const parcel = this.parcelsRepository.create({
      trackingNumber,
      userId,
      source,
      description,
    })

    await this.parcelsRepository.insert(parcel)

    return parcel.id
  }

  async find<R extends FindOptionsRelations<Parcel>>(
    options?: Omit<FindManyOptions<Parcel>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<Parcel, R>[]> {
    return this.parcelsRepository.find(options)
  }

  async findOneOrThrow<R extends FindOptionsRelations<Parcel>>(
    options: Omit<FindOneOptions<Parcel>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<Parcel, R>> {
    return this.parcelsRepository.findOneOrThrow(options)
  }

  async update(
    parcelId: string,
    {
      source,
      description,
      weightKg,
      deliveryFee,
    }: {
      source?: string | null
      description?: string | null
      weightKg?: string | null
      deliveryFee?: string | null
    }
  ): Promise<void> {
    await this.parcelsRepository.update(
      { id: parcelId },
      { source, description, weightKg, deliveryFee }
    )
  }

  async delete(parcelId: string): Promise<void> {
    await this.parcelsRepository.delete({ id: parcelId })
  }
}
