import { Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { Button } from '../../../components/button'
import { issueTemporaryPassword } from '../../../lib/api/api.gen'
import i18n from '../../../lib/i18n'

export function TemporaryPasswordDialog({
  userId,
  onClose,
}: {
  userId: string
  onClose: () => void
}) {
  const [password, setPassword] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const issue = async (): Promise<void> => {
    setIsSubmitting(true)
    try {
      const result = await issueTemporaryPassword(userId)
      setPassword(result.temporaryPassword)
    } catch {
      toast.error(i18n.t('auth:temporaryPassword.issueFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const copy = async (): Promise<void> => {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      toast.success(i18n.t('common:copied'))
    } catch {
      toast.error(i18n.t('common:copyFailed'))
    }
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose()
      }}
    >
      <Dialog.Content
        maxWidth="450px"
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault()
        }}
        onPointerDownOutside={(event) => {
          if (isSubmitting || password) event.preventDefault()
        }}
      >
        <Dialog.Title>
          {i18n.t('auth:temporaryPassword.issueTitle')}
        </Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {i18n.t(
            password
              ? 'auth:temporaryPassword.issuedDescription'
              : 'auth:temporaryPassword.issueDescription'
          )}
        </Dialog.Description>
        <Flex direction="column" gap="4">
          {password && (
            <label>
              <Text as="div" size="2" mb="2">
                {i18n.t('auth:password')}
              </Text>
              <TextField.Root
                value={password}
                readOnly
                autoComplete="off"
                onFocus={(event) => event.target.select()}
              />
            </label>
          )}
          <Flex gap="3" justify="end" wrap="wrap">
            <Dialog.Close>
              <Button variant="soft" color="gray" disabled={isSubmitting}>
                {i18n.t(
                  password ? 'auth:temporaryPassword.close' : 'common:cancel'
                )}
              </Button>
            </Dialog.Close>
            {password ? (
              <Button onClick={copy}>{i18n.t('common:copy')}</Button>
            ) : (
              <Button onClick={issue} loading={isSubmitting}>
                {i18n.t('auth:temporaryPassword.issueTitle')}
              </Button>
            )}
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
