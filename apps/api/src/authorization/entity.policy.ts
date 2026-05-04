import { AbilityBuilder } from '@casl/ability'

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

  get ability(): Ability {
    return this.contextService.getAbilityOrThrow()
  }
}
