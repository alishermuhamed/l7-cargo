import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import { Injectable } from '@nestjs/common'
import { DiscoveryService } from '@nestjs/core'

import { User } from '../users/entities/user.entity'
import type { Ability, SubjectClass } from './authorization.types'
import { EntityPolicyProvider } from './decorators/entity-policy-provider.decorator'
import { EntityPolicy } from './entity.policy'

@Injectable()
export class AbilityFactory {
  private entityPolicies?: Array<EntityPolicy<any>>

  constructor(private readonly discoveryService: DiscoveryService) {}

  createForUser(user: User): Ability {
    const builder = new AbilityBuilder<Ability>(createMongoAbility)

    for (const entityPolicy of this.getEntityPolicies()) {
      entityPolicy.defineRules(builder, user)
    }

    return builder.build({
      detectSubjectType: (object) => object.constructor as SubjectClass,
    })
  }

  private getEntityPolicies(): Array<EntityPolicy<any>> {
    if (this.entityPolicies) {
      return this.entityPolicies
    }

    const entityPolicies: Array<EntityPolicy<any>> = []

    const providers = this.discoveryService.getProviders({
      metadataKey: EntityPolicyProvider.KEY,
    })

    for (const provider of providers) {
      if (provider.instance instanceof EntityPolicy) {
        entityPolicies.push(provider.instance)
      }
    }

    this.entityPolicies = entityPolicies

    return this.entityPolicies
  }
}
