import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  Brackets,
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  IsNull,
  SelectQueryBuilder,
} from 'typeorm'

import { ClientsService } from '../clients/clients.service'
import { addMoneyAmounts } from '../common/money'
import { WithRelations } from '../db/db.types'
import type { User } from '../users/entities/user.entity'
import { Parcel } from './entities/parcel.entity'
import type { ParcelStatus } from './parcel-status'
import { ParcelsRepository } from './parcels.repository'

@Injectable()
export class ParcelsService {
  constructor(
    private readonly parcelsRepository: ParcelsRepository,
    private readonly clientsService: ClientsService
  ) {}

  async lockForClientMerge(clientIds: string[]): Promise<void> {
    await this.parcelsRepository.lockForClientMerge(clientIds)
  }

  async countByClient(clientId: string): Promise<number> {
    return this.parcelsRepository.countByClient(clientId)
  }

  async transferClient(sourceId: string, targetId: string): Promise<void> {
    await this.parcelsRepository.update(
      { clientId: sourceId },
      { clientId: targetId }
    )
  }

  async createParcel(
    {
      clientCode,
      trackingNumber,
      source,
      description,
      weightKg,
      deliveryFee,
      comments,
    }: {
      clientCode?: number
      trackingNumber: string
      source?: string
      description?: string
      weightKg?: string
      deliveryFee?: string
      comments?: string
    },
    user: User
  ): Promise<Parcel['id']> {
    let clientId: string | null

    if (user.role === 'client') {
      clientId = user.clientId
    } else if (clientCode !== undefined) {
      const client = await this.clientsService.findOrCreateByCode(clientCode)
      clientId = client.id
    } else {
      clientId = null
    }

    return this.createOrClaim({
      clientId,
      trackingNumber,
      source,
      description,
      weightKg,
      deliveryFee,
      comments,
    })
  }

  async createOrClaim({
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
    let existingParcel = await this.parcelsRepository.findOne({
      where: { trackingNumber: normalizedTrackingNumber },
    })

    if (existingParcel?.clientId === null && clientId !== null) {
      // Claim only an unassigned parcel, even if another request races us.
      const affected = await this.parcelsRepository.update(
        { id: existingParcel.id, clientId: IsNull() },
        { clientId, clientDeletedAt: null, source, description }
      )

      if (affected > 0) {
        return existingParcel.id
      }

      existingParcel = await this.parcelsRepository.findOne({
        where: { trackingNumber: normalizedTrackingNumber },
      })
    }

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

  async getParcels(
    {
      search,
      status,
      clientId,
      limit,
      offset,
    }: {
      search?: string
      status?: ParcelStatus
      clientId?: string
      limit?: number
      offset?: number
    },
    user: User
  ): Promise<Parcel[]> {
    const query = this.createVisibleParcelsQuery(user)

    if (status !== undefined) {
      query.andWhere('parcel.status = :status', { status })
    }

    if (clientId !== undefined) {
      query.andWhere('parcel.clientId = :clientId', { clientId })
    }

    if (search) {
      query.andWhere(
        new Brackets((searchQuery): void => {
          searchQuery
            .where('parcel.trackingNumber ILIKE :search')
            .orWhere('parcel.description ILIKE :search')
        }),
        { search: `%${search}%` }
      )
    }

    return query
      .orderBy('parcel.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany()
  }

  async getParcel(parcelId: string, user: User): Promise<Parcel> {
    const parcel = await this.createVisibleParcelsQuery(user)
      .andWhere('parcel.id = :parcelId', { parcelId })
      .getOne()

    if (!parcel) {
      throw new NotFoundException()
    }

    return parcel
  }

  private createVisibleParcelsQuery(user: User): SelectQueryBuilder<Parcel> {
    const query = this.parcelsRepository.createQueryBuilder()

    if (user.role !== 'admin') {
      query
        .andWhere('parcel.clientId = :visibleClientId', {
          visibleClientId: user.clientId,
        })
        .andWhere('parcel.clientDeletedAt IS NULL')
    }

    return query
  }

  async find<R extends FindOptionsRelations<Parcel>>(
    options: Omit<FindManyOptions<Parcel>, 'relations'> & {
      relations: R
    }
  ): Promise<WithRelations<Parcel, NoInfer<R>>[]>
  async find(options?: FindManyOptions<Parcel>): Promise<Parcel[]>
  async find<R extends FindOptionsRelations<Parcel>>(
    options?: FindManyOptions<Parcel>
  ): Promise<(Parcel | WithRelations<Parcel, R>)[]> {
    return this.parcelsRepository.find(options)
  }

  async findOne<R extends FindOptionsRelations<Parcel>>(
    options: Omit<FindOneOptions<Parcel>, 'relations'> & {
      relations: R
    }
  ): Promise<WithRelations<Parcel, NoInfer<R>> | null>
  async findOne(options: FindOneOptions<Parcel>): Promise<Parcel | null>
  async findOne<R extends FindOptionsRelations<Parcel>>(
    options: FindOneOptions<Parcel>
  ): Promise<Parcel | WithRelations<Parcel, R> | null> {
    return this.parcelsRepository.findOne(options)
  }

  async findOneOrThrow<R extends FindOptionsRelations<Parcel>>(
    options: Omit<FindOneOptions<Parcel>, 'relations'> & {
      relations: R
    }
  ): Promise<WithRelations<Parcel, NoInfer<R>>>
  async findOneOrThrow(options: FindOneOptions<Parcel>): Promise<Parcel>
  async findOneOrThrow<R extends FindOptionsRelations<Parcel>>(
    options: FindOneOptions<Parcel>
  ): Promise<Parcel | WithRelations<Parcel, R>> {
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
