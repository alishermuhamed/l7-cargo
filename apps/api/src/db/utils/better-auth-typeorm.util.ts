import type { CleanedWhere, Where } from 'better-auth/adapters'
import {
  type FindOptionsWhere,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  type ObjectLiteral,
} from 'typeorm'

export function toTypeOrmOperator(operator: Where['operator'], value: unknown) {
  switch (operator) {
    case 'ne':
      return Not(value)
    case 'lt':
      return LessThan(value)
    case 'lte':
      return LessThanOrEqual(value)
    case 'gt':
      return MoreThan(value)
    case 'gte':
      return MoreThanOrEqual(value)
    case 'in':
      return In(value as unknown[])
    case 'not_in':
      return Not(In(value as unknown[]))
    case 'contains':
      return Like(`%${value as string}%`)
    case 'starts_with':
      return Like(`${value as string}%`)
    case 'ends_with':
      return Like(`%${value as string}`)
    default:
      return value
  }
}

export function toTypeOrmWhere(
  where?: CleanedWhere[]
): FindOptionsWhere<ObjectLiteral> | FindOptionsWhere<ObjectLiteral>[] {
  if (!where || where.length === 0) {
    return {}
  }

  const toCondition = (w: CleanedWhere): FindOptionsWhere<ObjectLiteral> => {
    if (!w.operator || w.operator === 'eq') {
      return { [w.field]: w.value }
    }

    return { [w.field]: toTypeOrmOperator(w.operator, w.value) }
  }

  const andGroup = where.filter((w) => !w.connector || w.connector === 'AND')
  const orGroup = where.filter((w) => w.connector === 'OR')

  const andObject = andGroup.reduce<FindOptionsWhere<ObjectLiteral>>(
    (acc, w) => ({ ...acc, ...toCondition(w) }),
    {}
  )

  if (orGroup.length === 0) {
    return andObject
  }

  if (Object.keys(andObject).length === 0) {
    return orGroup.map((w) => toCondition(w))
  }

  return orGroup.map((w) => ({
    ...andObject,
    ...toCondition(w),
  }))
}
