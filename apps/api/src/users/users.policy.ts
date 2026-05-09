import { AbilityBuilder } from '@casl/ability'
import { ForbiddenException, Injectable } from '@nestjs/common'

import { Ability } from '../authorization/authorization.types'
import { EntityPolicyProvider } from '../authorization/decorators/entity-policy-provider.decorator'
import { EntityPolicy } from '../authorization/entity.policy'
import { ContextService } from '../context/context.service'
import { User } from './entities/user.entity'

@EntityPolicyProvider()
@Injectable()
export class UsersPolicy extends EntityPolicy<User> {
  constructor(protected readonly contextService: ContextService) {
    super(contextService, User)
  }

  defineRules(builder: AbilityBuilder<Ability>, user: User): void {
    const { can } = builder

    if (user.role === 'admin') {
      can('read', User)
      return
    }
  }

  checkCanList(): void {
    const user = this.contextService.getUserOrThrow()

    if (user.role !== 'admin') {
      throw new ForbiddenException()
    }
  }
}
