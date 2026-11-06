import { zodResolver } from '@hookform/resolvers/zod'
import { Card, Container, Flex, Heading, Text } from '@radix-ui/themes'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import { Button } from '../../components/button'
import {
  Form,
  FormField,
  FormFieldControl,
  FormFieldError,
  FormFieldItem,
  FormFieldLabel,
} from '../../components/form'
import { TextField } from '../../components/text-field'
import { changeTemporaryPassword } from '../../lib/api/api.gen'
import { ApiError } from '../../lib/api/custom-fetch'
import { authClient } from '../../lib/auth-client'
import i18n from '../../lib/i18n'

export const Route = createFileRoute('/_authenticated/change-password')({
  component: ChangePasswordPage,
})

const schema = z
  .object({
    password: z
      .string()
      .min(8, i18n.t('validation:password.tooShort'))
      .max(128, i18n.t('validation:password.tooLong')),
    confirmPassword: z.string(),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ['confirmPassword'],
    message: i18n.t('auth:temporaryPassword.mismatch'),
  })

type FormValues = z.infer<typeof schema>

function ChangePasswordPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async ({ password }: FormValues): Promise<void> => {
    try {
      await changeTemporaryPassword({ newPassword: password })
      await authClient.getSession({ query: { disableCookieCache: true } })
      await router.invalidate()
      await navigate({ to: '/', replace: true })
    } catch (error: unknown) {
      const samePassword =
        error instanceof ApiError &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'message' in error.data &&
        error.data.message === 'PASSWORD_MUST_DIFFER'
      form.setError('password', {
        message: i18n.t(
          samePassword
            ? 'auth:temporaryPassword.mustDiffer'
            : 'auth:temporaryPassword.changeFailed'
        ),
      })
    }
  }

  const signOut = async (): Promise<void> => {
    const result = await authClient.signOut()
    if (result.error) {
      toast.error(i18n.t('auth:temporaryPassword.signOutFailed'))
      return
    }
    queryClient.clear()
    await navigate({ to: '/auth/sign-in', replace: true })
  }

  return (
    <Container size="1" pt="9" px="4">
      <Card size="3">
        <Flex direction="column" gap="4">
          <Heading size="5">
            {i18n.t('auth:temporaryPassword.changeTitle')}
          </Heading>
          <Text size="2" color="gray">
            {i18n.t('auth:temporaryPassword.changeDescription')}
          </Text>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Flex direction="column" gap="4">
                {(['password', 'confirmPassword'] as const).map((name) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormFieldItem>
                        <FormFieldLabel>
                          {i18n.t(
                            name === 'password'
                              ? 'auth:newPassword'
                              : 'auth:temporaryPassword.confirmPassword'
                          )}
                        </FormFieldLabel>
                        <FormFieldControl>
                          <TextField.Root
                            {...field}
                            type="password"
                            autoComplete="new-password"
                            disabled={form.formState.isSubmitting}
                          />
                        </FormFieldControl>
                        <FormFieldError />
                      </FormFieldItem>
                    )}
                  />
                ))}
                <Button type="submit" loading={form.formState.isSubmitting}>
                  {i18n.t('common:save')}
                </Button>
                <Button
                  type="button"
                  variant="soft"
                  color="gray"
                  disabled={form.formState.isSubmitting}
                  onClick={signOut}
                >
                  {i18n.t('common:signOut')}
                </Button>
              </Flex>
            </form>
          </Form>
        </Flex>
      </Card>
    </Container>
  )
}
