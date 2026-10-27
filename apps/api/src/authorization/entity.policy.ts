import { AbilityBuilder } from '@casl/ability'
import { ForbiddenException } from '@nestjs/common'

import { ContextService } from '../context/context.service'
import { BaseEntity } from '../db/base.entity'
import { User } from '../users/entities/user.entity'
import { Ability } from './authorization.types'

export abstract class EntityPolicy<Entity extends BaseEntity> {
  constructor(
    protected readonly contextService: ContextService,
    protected readonly entity: { new (): Entity }
  ) {}

  abstract defineRules(builder: AbilityBuilder<Ability>, user: User): void

  protected checkIsAdmin(): void {
    const user = this.contextService.getUserOrThrow()

    if (user.role !== 'admin') {
      throw new ForbiddenException()
    }
  }

  get ability(): Ability {
    return this.contextService.getAbilityOrThrow()
  }
}
