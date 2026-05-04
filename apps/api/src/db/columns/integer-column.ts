import { Column, ColumnOptions } from 'typeorm'

/**
 * `@Column({ type: 'integer', ...options })`
 */
export function IntegerColumn(
  options: Omit<ColumnOptions, 'type'> = {}
): PropertyDecorator {
  return Column({ type: 'integer', ...options })
}
