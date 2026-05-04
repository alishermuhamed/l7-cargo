import type { MakeNullableFieldsOptional } from '@l7-cargo/shared/types/utility-types'
import type { FindOptionsRelations, FindOptionsWhere } from 'typeorm'

import type { BaseEntity } from './base.entity'

export type Where<Entity extends BaseEntity> =
  | FindOptionsWhere<Entity>
  | FindOptionsWhere<Entity>[]

export type CreateInput<Entity extends BaseEntity> = Omit<
  MakeNullableFieldsOptional<Entity>,
  keyof BaseEntity
>

export type WithRelations<E, R extends FindOptionsRelations<E>> = Omit<
  E,
  keyof R & keyof E
> & {
  [P in keyof R & keyof E]-?: R[P] extends true
    ? Exclude<E[P], undefined>
    : Exclude<E[P], undefined> extends Array<infer U>
      ? R[P] extends FindOptionsRelations<U>
        ? WithRelations<U, R[P]>[]
        : U[]
      : R[P] extends FindOptionsRelations<NonNullable<E[P]>>
        ? null extends E[P]
          ? WithRelations<NonNullable<E[P]>, R[P]> | null
          : WithRelations<NonNullable<E[P]>, R[P]>
        : E[P]
}
