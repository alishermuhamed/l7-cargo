import { Column, ColumnOptions } from 'typeorm'

/**
 * `@Column({ type: 'timestamp with time zone', ...options })`
 */
export function DateTimeColumn(
  options: Omit<ColumnOptions, 'type'> = {}
): PropertyDecorator {
  return Column({ type: 'timestamp with time zone', ...options })
}
