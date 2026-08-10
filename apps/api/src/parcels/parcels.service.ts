import { ConflictException, Injectable } from '@nestjs/common'
import { FindManyOptions, FindOneOptions, FindOptionsRelations } from 'typeorm'

import { WithRelations } from '../db/db.types'
import { Parcel } from './entities/parcel.entity'
import type { ParcelStatus } from './parcel-status'
import { ParcelsRepository } from './parcels.repository'

@Injectable()
export class ParcelsService {
  constructor(private readonly parcelsRepository: ParcelsRepository) {}

  async create({
    userId,
    trackingNumber,
    status,
    source,
    description,
    weightKg,
    deliveryFee,
    notes,
  }: {
    userId: string | null
    trackingNumber: string
    status?: ParcelStatus | null
    source?: string
    description?: string
    weightKg?: string | null
    deliveryFee?: string | null
    notes?: string | null
  }): Promise<Parcel['id']> {
    const normalizedTrackingNumber = trackingNumber.trim()
    const existingParcel = await this.parcelsRepository.findOne({
      where: { trackingNumber: normalizedTrackingNumber },
    })

    if (existingParcel) {
      throw new ConflictException('PARCEL_TRACKING_NUMBER_EXISTS')
    }

    const parcel = this.parcelsRepository.create({
      trackingNumber: normalizedTrackingNumber,
      userId,
      status,
      source,
      description,
      weightKg,
      deliveryFee,
      notes,
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

  async findOne<R extends FindOptionsRelations<Parcel>>(
    options: Omit<FindOneOptions<Parcel>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<Parcel, R> | null> {
    return this.parcelsRepository.findOne(options)
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
      userId,
      status,
      source,
      description,
      weightKg,
      deliveryFee,
      notes,
    }: {
      userId?: string | null
      status?: ParcelStatus | null
      source?: string | null
      description?: string | null
      weightKg?: string | null
      deliveryFee?: string | null
      notes?: string | null
    }
  ): Promise<void> {
    await this.parcelsRepository.update(
      { id: parcelId },
      { userId, status, source, description, weightKg, deliveryFee, notes }
    )
  }

  async delete(parcelId: string): Promise<void> {
    await this.parcelsRepository.delete({ id: parcelId })
  }
}
