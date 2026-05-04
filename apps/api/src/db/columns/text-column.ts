import { Column, ColumnOptions } from 'typeorm'

/**
 * `@Column({ type: 'text', ...options })`
 */
export function TextColumn(
  options: Omit<ColumnOptions, 'type'> = {}
): PropertyDecorator {
  return Column({ type: 'text', ...options })
}
