import { CopyIcon } from '@radix-ui/react-icons'
import type { ComponentProps, MouseEvent } from 'react'
import toast from 'react-hot-toast'

import i18n from '../lib/i18n'
import { IconButton } from './icon-button'

interface CopyButtonProps extends Omit<
  ComponentProps<typeof IconButton>,
  'tooltip' | 'aria-label' | 'children'
> {
  data: string
}

export function CopyButton({ data, onClick, ...props }: CopyButtonProps) {
  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    try {
      await navigator.clipboard.writeText(data)
      toast.success(i18n.t('common:copied'))
    } catch {
      toast.error(i18n.t('common:copyFailed'))
    }

    onClick?.(event)
  }

  return (
    <IconButton
      tooltip={i18n.t('common:copy')}
      aria-label={i18n.t('common:copy')}
      size="1"
      variant="ghost"
      color="gray"
      onClick={handleClick}
      {...props}
    >
      <CopyIcon />
    </IconButton>
  )
}
