import { Column, ColumnOptions } from 'typeorm'

/**
 * `@Column({ type: 'numeric', ...options })`
 */
export function DecimalColumn(
  options: Omit<ColumnOptions, 'type'> & {
    precision: number
    scale: number
  }
): PropertyDecorator {
  return Column({ type: 'numeric', ...options })
}

/**
 * `@DecimalColumn({ precision: 14, scale: 4, ...options })`
 */
export function MoneyColumn(
  options: Omit<ColumnOptions, 'precision' | 'scale' | 'type'> = {}
): PropertyDecorator {
  return DecimalColumn({ precision: 14, scale: 4, ...options })
}
