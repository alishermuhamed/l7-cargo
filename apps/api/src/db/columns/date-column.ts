import { Column, ColumnOptions } from 'typeorm'

/**
 * `@Column({ type: 'date', ...options })`
 */
export function DateColumn(
  options: Omit<ColumnOptions, 'type'> = {}
): PropertyDecorator {
  return Column({ type: 'date', ...options })
}
