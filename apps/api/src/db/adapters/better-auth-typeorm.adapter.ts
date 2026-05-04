import { Injectable } from '@nestjs/common'
import { Propagation, TransactionHost } from '@nestjs-cls/transactional'
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm'
import { BetterAuthError, type BetterAuthOptions, DBAdapter } from 'better-auth'
import {
  type AdapterFactoryConfig,
  CleanedWhere,
  createAdapterFactory,
} from 'better-auth/adapters'
import { ObjectLiteral, Repository } from 'typeorm'

import { toTypeOrmWhere } from '../utils/better-auth-typeorm.util'

@Injectable()
export class BetterAuthTypeOrmAdapter {
  private adapter?: DBAdapter

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>
  ) {}

  private get config(): AdapterFactoryConfig {
    return {
      adapterId: 'typeorm',
      adapterName: 'TypeORM Adapter',
      transaction: (fn) => {
        const run = async () => {
          if (!this.adapter) {
            throw new Error('Transaction adapter is undefined')
          }

          return fn(this.adapter)
        }

        if (this.txHost.isTransactionActive()) {
          return run()
        }

        return this.txHost.withTransaction(Propagation.Required, run)
      },
    }
  }

  build(options: BetterAuthOptions): DBAdapter {
    if (!this.adapter) {
      this.adapter = createAdapterFactory({
        config: this.config,
        adapter: () => ({
          create: (data) => this.create(data),
          update: (data) => this.update(data),
          delete: (data) => this.delete(data),
          findOne: (data) => this.findOne(data),
          findMany: (data) => this.findMany(data),
          count: (data) => this.count(data),
          updateMany: (data) => this.updateMany(data),
          deleteMany: (data) => this.deleteMany(data),
        }),
      })(options)
    }

    return this.adapter
  }

  private getRepository(model: string): Repository<ObjectLiteral> {
    return this.txHost.tx.getRepository(model)
  }

  private async create<T extends Record<string, unknown>, R = T>({
    model,
    data,
    select,
  }: {
    model: string
    data: Omit<T, 'id'>
    select?: string[]
  }): Promise<R> {
    const repository = this.getRepository(model)

    try {
      const insertResult = await repository.insert(data)
      const id = insertResult.identifiers[0].id as string

      return (await repository.findOneOrFail({
        select: select?.reduce((acc, prop) => ({ ...acc, [prop]: true }), {}),
        where: { id },
      })) as R
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new BetterAuthError(`Failed to create ${model}: ${message}`)
    }
  }

  private async update<T>({
    model,
    where,
    update,
  }: {
    model: string
    where: CleanedWhere[]
    update: T
  }): Promise<T | null> {
    const repository = this.getRepository(model)

    const updatePayload = update as Record<string, unknown>

    try {
      const findOptions = toTypeOrmWhere(where)

      if (where.length === 1) {
        const record = await repository.findOne({ where: findOptions })

        if (!record) {
          return null
        }

        await repository.update(findOptions, updatePayload)

        const id = record.id as unknown

        const result =
          typeof id === 'string'
            ? await repository.findOne({ where: { id } })
            : await repository.findOne({ where: findOptions })

        return result as T | null
      }

      await repository.update(findOptions, updatePayload)
      return null
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new BetterAuthError(`Failed to update ${model}: ${message}`)
    }
  }

  private async delete({
    model,
    where,
  }: {
    model: string
    where: CleanedWhere[]
  }): Promise<void> {
    const repository = this.getRepository(model)

    try {
      const findOptions = toTypeOrmWhere(where)
      await repository.delete(findOptions)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new BetterAuthError(`Failed to delete ${model}: ${message}`)
    }
  }

  private async findOne<T>({
    model,
    where,
    select,
  }: {
    model: string
    where: CleanedWhere[]
    select?: string[]
  }): Promise<T | null> {
    const repository = this.getRepository(model)

    try {
      const findOptions = toTypeOrmWhere(where)
      return (await repository.findOne({
        select: select?.reduce((acc, prop) => ({ ...acc, [prop]: true }), {}),
        where: findOptions,
      })) as T | null
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new BetterAuthError(`Failed to find ${model}: ${message}`)
    }
  }

  private async findMany<T>({
    model,
    where,
    limit,
    offset,
    sortBy,
  }: {
    model: string
    where?: CleanedWhere[]
    limit: number
    offset?: number
    sortBy?: { field: string; direction: 'asc' | 'desc' }
  }): Promise<T[]> {
    const repository = this.getRepository(model)

    try {
      const findOptions = toTypeOrmWhere(where)

      return (await repository.find({
        where: findOptions,
        take: limit,
        skip: offset ?? 0,
        order: sortBy
          ? {
              [sortBy.field]: sortBy.direction === 'desc' ? 'DESC' : 'ASC',
            }
          : undefined,
      })) as T[]
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new BetterAuthError(`Failed to find many ${model}: ${message}`)
    }
  }

  private async count({
    model,
    where,
  }: {
    model: string
    where?: CleanedWhere[]
  }): Promise<number> {
    const repository = this.getRepository(model)

    try {
      const findOptions = where ? toTypeOrmWhere(where) : undefined
      return await repository.count({ where: findOptions })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new BetterAuthError(`Failed to count ${model}: ${message}`)
    }
  }

  private async updateMany({
    model,
    where,
    update,
  }: {
    model: string
    where: CleanedWhere[]
    update: Record<string, unknown>
  }): Promise<number> {
    const repository = this.getRepository(model)

    try {
      const findOptions = toTypeOrmWhere(where)
      const updateResult = await repository.update(findOptions, update)
      return updateResult.affected ?? 0
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new BetterAuthError(`Failed to update many ${model}: ${message}`)
    }
  }

  private async deleteMany({
    model,
    where,
  }: {
    model: string
    where: CleanedWhere[]
  }): Promise<number> {
    const repository = this.getRepository(model)

    try {
      const findOptions = toTypeOrmWhere(where)
      const deleteResult = await repository.delete(findOptions)
      return deleteResult.affected ?? 0
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new BetterAuthError(`Failed to delete many ${model}: ${message}`)
    }
  }
}
