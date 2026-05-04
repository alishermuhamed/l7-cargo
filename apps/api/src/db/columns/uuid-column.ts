import { Column, ColumnOptions } from 'typeorm'

/**
 * `@Column({ type: 'uuid', ...options })`
 */
export function UUIDColumn(
  options: Omit<ColumnOptions, 'type'> = {}
): PropertyDecorator {
  return Column({ type: 'uuid', ...options })
}
