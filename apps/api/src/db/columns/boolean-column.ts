import { Column, ColumnOptions } from 'typeorm'

/**
 * `@Column({ type: 'boolean', ...options })`
 */
export function BooleanColumn(
  options: Omit<ColumnOptions, 'type'> = {}
): PropertyDecorator {
  return Column({ type: 'boolean', ...options })
}
