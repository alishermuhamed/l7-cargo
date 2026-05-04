import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from '@casl/ability'
import { createContextualCan, useAbility } from '@casl/react'
import { createContext } from 'react'

export type Action =
  // pages
  | 'access'

  // entities
  | 'create'
  | 'read'
  | 'update'
  | 'delete'

export type Subject =
  // pages
  | 'SomePage'

  // entities
  | 'SomeEntity'

export type Ability = MongoAbility<[Action, Subject]>

const EMPTY_ABILITY = createMongoAbility<[Action, Subject]>([])

export const AbilityContext = createContext<Ability>(EMPTY_ABILITY)

export const Can = createContextualCan(AbilityContext.Consumer)

export function buildAbility(): Ability {
  const { can, build } = new AbilityBuilder<Ability>(createMongoAbility)

  can('access', 'SomePage')

  return build()
}

export function useUserAbility() {
  return useAbility(AbilityContext)
}
