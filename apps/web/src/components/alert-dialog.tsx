import { AlertDialog as RadixAlertDialog, Button, Flex } from '@radix-ui/themes'
import type { ComponentProps } from 'react'

import i18n from '../lib/i18n'

type ButtonColor = ComponentProps<typeof Button>['color']

interface AlertDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description: string
  cancelLabel?: string
  onCancel?: () => void
  actionLabel: string
  actionColor?: ButtonColor
  onAction: () => void
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel,
  onCancel,
  actionLabel,
  actionColor,
  onAction,
}: AlertDialogProps) {
  return (
    <RadixAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixAlertDialog.Content maxWidth="450px">
        <RadixAlertDialog.Title>{title}</RadixAlertDialog.Title>

        <RadixAlertDialog.Description size="2">
          {description}
        </RadixAlertDialog.Description>

        <Flex mt="5" justify="end" gap="3">
          <RadixAlertDialog.Cancel>
            <Button variant="soft" color="gray" onClick={onCancel}>
              {cancelLabel ?? i18n.t('common:cancel')}
            </Button>
          </RadixAlertDialog.Cancel>

          <RadixAlertDialog.Action>
            <Button color={actionColor} variant="solid" onClick={onAction}>
              {actionLabel}
            </Button>
          </RadixAlertDialog.Action>
        </Flex>
      </RadixAlertDialog.Content>
    </RadixAlertDialog.Root>
  )
}
