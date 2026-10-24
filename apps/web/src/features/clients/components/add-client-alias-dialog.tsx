import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, Flex, TextField } from '@radix-ui/themes'
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
import { useAddClientAlias } from '../hooks/use-add-client-alias'

const MAX_CLIENT_CODE = 2147483647

const addClientAliasSchema = z.object({
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

type AddClientAliasFormValues = z.infer<typeof addClientAliasSchema>

export function AddClientAliasDialog({
  client,
  onClose,
}: {
  client: GetClientResponseDto
  onClose: () => void
}) {
  const addClientAliasMutation = useAddClientAlias(client.id)

  const form = useForm<AddClientAliasFormValues>({
    resolver: zodResolver(addClientAliasSchema),
    defaultValues: { code: '' },
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async ({ code }: AddClientAliasFormValues) => {
    try {
      await addClientAliasMutation.mutateAsync({
        code: Number(code),
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
        <Dialog.Title>{i18n.t('clients:codes.add')}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {i18n.t('clients:codes.addDescription')}
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
