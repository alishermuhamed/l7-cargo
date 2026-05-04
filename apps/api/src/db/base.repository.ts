import { NotFoundException } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm'
import { randomUUID } from 'crypto'
import {
  type EntityManager,
  type FindManyOptions,
  type FindOneOptions,
  type FindOptionsRelations,
  type QueryDeepPartialEntity,
  type Repository,
} from 'typeorm'

import type { ContextService } from '../context/context.service'
import type { BaseEntity } from './base.entity'
import type { CreateInput, Where, WithRelations } from './db.types'

export abstract class BaseRepository<Entity extends BaseEntity> {
  constructor(
    protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    protected readonly contextService: ContextService,
    protected readonly entity: { new (): Entity }
  ) {}

  protected get manager(): EntityManager {
    return this.txHost.tx
  }

  protected get repository(): Repository<Entity> {
    return this.manager.getRepository(this.entity)
  }

  protected getBaseEntity(): Entity {
    const entity = new this.entity()
    entity.id = randomUUID()
    entity.createdAt = new Date()
    entity.updatedAt = new Date()
    return entity
  }

  create(data: CreateInput<Entity>): Entity {
    const entity = this.getBaseEntity()

    for (const key of Object.keys(data) as Array<keyof CreateInput<Entity>>) {
      entity[key] = (data[key] ?? null) as Entity[typeof key]
    }

    return entity
  }

  async insert(entity: Entity): Promise<Entity['id']>
  async insert(entity: Entity[]): Promise<Entity['id'][]>
  async insert(
    entity: Entity | Entity[]
  ): Promise<Entity['id'] | Entity['id'][]> {
    await this.repository.insert(
      entity as
        | QueryDeepPartialEntity<Entity>
        | QueryDeepPartialEntity<Entity>[]
    )

    if (Array.isArray(entity)) {
      return entity.map(({ id }) => id)
    }

    return entity.id
  }

  async find<R extends FindOptionsRelations<Entity>>(
    options?: Omit<FindManyOptions<Entity>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<Entity, R>[]> {
    const result = await this.repository.find(options)
    return result as WithRelations<Entity, R>[]
  }

  async findOne<R extends FindOptionsRelations<Entity>>(
    options: Omit<FindOneOptions<Entity>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<Entity, R> | null> {
    const result = await this.repository.findOne(options)

    if (!result) {
      return null
    }

    return result as WithRelations<Entity, R>
  }

  async findOneOrThrow<R extends FindOptionsRelations<Entity>>(
    options: Omit<FindOneOptions<Entity>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<Entity, R>> {
    const result = await this.findOne(options)

    if (!result) {
      throw new NotFoundException()
    }

    return result
  }

  async update(
    criteria: Where<Entity>,
    partialEntity: QueryDeepPartialEntity<Entity>
  ): Promise<number> {
    const updateResult = await this.repository.update(criteria, partialEntity)
    return updateResult.affected ?? 0
  }

  async delete(criteria: Where<Entity>): Promise<number> {
    const deleteResult = await this.repository.delete(criteria)
    return deleteResult.affected ?? 0
  }
}
