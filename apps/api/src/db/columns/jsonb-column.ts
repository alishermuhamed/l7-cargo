import { Column, ColumnOptions } from 'typeorm'

/**
 * `@Column({ type: 'jsonb', ...options })`
 */
export function JsonbColumn(
  options: Omit<ColumnOptions, 'type'> = {}
): PropertyDecorator {
  return Column({ type: 'jsonb', ...options })
}
