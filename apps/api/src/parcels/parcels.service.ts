import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'
import { FindManyOptions, FindOneOptions, FindOptionsRelations } from 'typeorm'

import { ClientsService } from '../clients/clients.service'
import { addMoneyAmounts } from '../common/money'
import { WithRelations } from '../db/db.types'
import { Parcel } from './entities/parcel.entity'
import type { ParcelStatus } from './parcel-status'
import { ParcelsRepository } from './parcels.repository'

@Injectable()
export class ParcelsService {
  constructor(
    private readonly parcelsRepository: ParcelsRepository,
    private readonly clientsService: ClientsService
  ) {}

  async create({
    clientId,
    trackingNumber,
    status,
    source,
    description,
    weightKg,
    deliveryFee,
    comments,
  }: {
    clientId: string | null
    trackingNumber: string
    status?: ParcelStatus | null
    source?: string
    description?: string
    weightKg?: string | null
    deliveryFee?: string | null
    comments?: string | null
  }): Promise<Parcel['id']> {
    const normalizedTrackingNumber = trackingNumber.trim()
    const existingParcel = await this.parcelsRepository.findOne({
      where: { trackingNumber: normalizedTrackingNumber },
    })

    if (existingParcel) {
      if (clientId !== null && existingParcel.clientId === clientId) {
        throw new ConflictException({
          message: 'PARCEL_ALREADY_OWNED_BY_CLIENT',
          parcelId: existingParcel.id,
        })
      }

      throw new ConflictException('PARCEL_TRACKING_NUMBER_EXISTS')
    }

    const parcel = this.parcelsRepository.create({
      trackingNumber: normalizedTrackingNumber,
      clientId,
      status,
      source,
      description,
      weightKg,
      deliveryFee,
      comments,
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
      clientCode,
      status,
      source,
      description,
      weightKg,
      deliveryFee,
      comments,
    }: {
      clientCode?: number | null
      status?: ParcelStatus | null
      source?: string | null
      description?: string | null
      weightKg?: string | null
      deliveryFee?: string | null
      comments?: string | null
    }
  ): Promise<void> {
    let clientId: string | null | undefined

    if (clientCode === null) {
      clientId = null
    } else if (clientCode !== undefined) {
      const client = await this.clientsService.findOneByClientCode(clientCode)

      if (!client) {
        throw new BadRequestException('CLIENT_CODE_NOT_FOUND')
      }

      clientId = client.id
    }

    await this.parcelsRepository.update(
      { id: parcelId },
      {
        clientId,
        clientDeletedAt: clientId !== undefined ? null : undefined,
        status,
        source,
        description,
        weightKg,
        deliveryFee,
        comments,
      }
    )
  }

  async delete(parcelId: string): Promise<void> {
    await this.parcelsRepository.delete({ id: parcelId })
  }

  async getReadyForPickupBalance(clientId: string): Promise<string> {
    const parcels = await this.find({
      where: { clientId, status: 'ready_for_pickup' },
      select: { deliveryFee: true },
    })

    const deliveryFees = parcels
      .map((parcel) => parcel.deliveryFee)
      .filter((deliveryFee): deliveryFee is string => deliveryFee !== null)

    return addMoneyAmounts(deliveryFees)
  }

  async hideFromClient(parcelId: string): Promise<void> {
    await this.parcelsRepository.update(
      { id: parcelId },
      { clientDeletedAt: new Date() }
    )
  }
}
