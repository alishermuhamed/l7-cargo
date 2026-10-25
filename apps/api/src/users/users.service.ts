import { Injectable } from '@nestjs/common'
import { FindManyOptions, FindOneOptions, FindOptionsRelations } from 'typeorm'

import { WithRelations } from '../db/db.types'
import { User } from './entities/user.entity'
import { UsersRepository } from './users.repository'

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async transferClient(sourceId: string, targetId: string): Promise<void> {
    await this.usersRepository.update(
      { clientId: sourceId },
      { clientId: targetId }
    )
  }

  async find<R extends FindOptionsRelations<User>>(
    options?: Omit<FindManyOptions<User>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<User, R>[]> {
    return this.usersRepository.find(options)
  }

  async findOneOrThrow<R extends FindOptionsRelations<User>>(
    options: Omit<FindOneOptions<User>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<User, R>> {
    return this.usersRepository.findOneOrThrow(options)
  }
}
