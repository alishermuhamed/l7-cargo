import { Block } from '@tanstack/react-router'
import {
  type FieldValues,
  type UseFormReturn,
  useFormState,
} from 'react-hook-form'

import i18n from '../lib/i18n'
import { AlertDialog } from './alert-dialog'

interface UnsavedChangesBlockerProps<T extends FieldValues> {
  form: UseFormReturn<T>
}

export function UnsavedChangesBlocker<T extends FieldValues>({
  form,
}: UnsavedChangesBlockerProps<T>) {
  const { isDirty } = useFormState({ control: form.control })

  return (
    <Block shouldBlockFn={() => isDirty} withResolver>
      {({ status, proceed, reset }) => (
        <AlertDialog
          open={status === 'blocked'}
          onCancel={reset}
          onAction={proceed ?? (() => {})}
          title={i18n.t('common:discardChangesTitle')}
          description={i18n.t('common:discardChangesDescription')}
          cancelLabel={i18n.t('common:keepEditing')}
          actionLabel={i18n.t('common:discardChanges')}
          actionColor="red"
        />
      )}
    </Block>
  )
}
