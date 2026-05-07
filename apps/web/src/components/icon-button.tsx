import { IconButton as RadixIconButton, Tooltip } from '@radix-ui/themes'
import type { ComponentProps, ReactNode } from 'react'

interface IconButtonProps extends ComponentProps<typeof RadixIconButton> {
  tooltip?: ReactNode
}

export function IconButton({ tooltip, ...props }: IconButtonProps) {
  const button = <RadixIconButton {...props} />

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>
  }

  return button
}
