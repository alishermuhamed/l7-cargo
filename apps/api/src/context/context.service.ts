import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ClsService, type ClsStore, type Terminal } from 'nestjs-cls'

import type { Ability } from '../authorization/authorization.types'
import type { User } from '../users/entities/user.entity'

export interface ContextStore extends ClsStore {
  userId?: string
  user?: Terminal<User>
  ability?: Terminal<Ability>
}

@Injectable()
export class ContextService {
  constructor(private readonly clsService: ClsService<ContextStore>) {}

  setUser(user: User) {
    this.clsService.set('user', user)
  }

  getUserOrThrow(): User {
    const user = this.clsService.get('user')

    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }

  getUserIdOrThrow(): string {
    const user = this.getUserOrThrow()
    return user.id
  }

  setAbility(ability: Ability) {
    this.clsService.set('ability', ability)
  }

  getAbility(): Ability | undefined {
    return this.clsService.get('ability')
  }

  getAbilityOrThrow(): Ability {
    const ability = this.getAbility()

    if (!ability) {
      throw new UnauthorizedException()
    }

    return ability
  }
}
