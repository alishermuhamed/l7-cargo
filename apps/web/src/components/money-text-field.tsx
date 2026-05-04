import type { ComponentProps } from 'react'

import { TextField } from './text-field'

interface MoneyTextFieldProps extends ComponentProps<typeof TextField.Root> {
  currency: string
}

export function MoneyTextField({ currency, ...props }: MoneyTextFieldProps) {
  return (
    <TextField.Root inputMode="decimal" {...props}>
      <TextField.Slot side="right">{currency}</TextField.Slot>
    </TextField.Root>
  )
}
