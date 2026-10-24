import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, Flex, TextField } from '@radix-ui/themes'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'

import { Button } from '../../../components/button'
import {
  Form,
  FormField,
  FormFieldControl,
  FormFieldError,
  FormFieldItem,
  FormFieldLabel,
} from '../../../components/form'
import { type GetClientResponseDto } from '../../../lib/api/api.gen'
import { ApiError } from '../../../lib/api/custom-fetch'
import i18n from '../../../lib/i18n'
import { useUpdateClientCode } from '../hooks/use-update-client-code'

const MAX_CLIENT_CODE = 2147483647

const changeCodeSchema = z.object({
  code: z.string().refine(
    (value) => {
      const code = Number(value)
      return (
        /^\d+$/.test(value) &&
        Number.isInteger(code) &&
        code >= 1 &&
        code <= MAX_CLIENT_CODE
      )
    },
    { message: i18n.t('clients:codes.invalid') }
  ),
})

type ChangeCodeFormValues = z.infer<typeof changeCodeSchema>

export function ChangeCodeDialog({
  client,
  onClose,
}: {
  client: GetClientResponseDto
  onClose: () => void
}) {
  const [expectedCode] = useState(client.code)

  const updateClientCodeMutation = useUpdateClientCode(client.id)

  const form = useForm<ChangeCodeFormValues>({
    resolver: zodResolver(changeCodeSchema),
    defaultValues: { code: '' },
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async ({ code }: ChangeCodeFormValues) => {
    try {
      await updateClientCodeMutation.mutateAsync({
        code: Number(code),
        expectedCode,
      })
      toast.success(i18n.t('clients:codes.saved'))
      onClose()
    } catch (cause: unknown) {
      form.setError('code', {
        type: 'server',
        message:
          cause instanceof ApiError && cause.status === 409
            ? i18n.t('clients:codes.conflict')
            : i18n.t('clients:codes.failed'),
      })
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
          if (isSubmitting) event.preventDefault()
        }}
      >
        <Dialog.Title>{i18n.t('clients:codes.change')}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {i18n.t('clients:codes.changeDescription', { code: expectedCode })}
        </Dialog.Description>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Flex direction="column" gap="3">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormFieldItem>
                    <FormFieldLabel>
                      {i18n.t('clients:codes.newCode')}
                    </FormFieldLabel>
                    <FormFieldControl>
                      <TextField.Root
                        {...field}
                        inputMode="numeric"
                        autoComplete="off"
                        disabled={isSubmitting}
                        autoFocus
                      />
                    </FormFieldControl>
                    <FormFieldError />
                  </FormFieldItem>
                )}
              />
              <Flex gap="3" justify="end" wrap="wrap">
                <Dialog.Close>
                  <Button
                    type="button"
                    variant="soft"
                    color="gray"
                    disabled={isSubmitting}
                  >
                    {i18n.t('common:cancel')}
                  </Button>
                </Dialog.Close>
                <Button type="submit" loading={isSubmitting}>
                  {i18n.t('common:save')}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog.Root>
  )
}
