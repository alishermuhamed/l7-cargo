import { zodResolver } from '@hookform/resolvers/zod'
import { Card, Container, Flex, Heading, Text } from '@radix-ui/themes'
import {
  createFileRoute,
  Link as RouterLink,
  useNavigate,
} from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import PhoneInput from 'react-phone-number-input/input'
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
import { authClient } from '../../lib/auth-client'
import i18n from '../../lib/i18n'

export const Route = createFileRoute('/auth/forgot-password')({
  validateSearch: z.object({
    phoneNumber: z.string().trim().optional(),
    redirectTo: z.string().optional(),
  }),
  component: ForgotPasswordPage,
})

const forgotPasswordSchema = z.object({
  phoneNumber: z
    .string(i18n.t('validation:phoneNumber.required'))
    .trim()
    .min(1, i18n.t('validation:phoneNumber.required')),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { phoneNumber, redirectTo } = Route.useSearch()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { phoneNumber: phoneNumber ?? '' },
  })

  const onSubmit = async ({ phoneNumber }: ForgotPasswordFormValues) => {
    try {
      const result = await authClient.phoneNumber.requestPasswordReset({
        phoneNumber,
      })

      if (result.error) {
        toast.error(i18n.t('errors:unableToRequestPasswordReset'))
        return
      }

      await navigate({
        to: '/auth/reset-password',
        search: { phoneNumber, redirectTo },
      })
    } catch {
      toast.error(i18n.t('errors:unableToRequestPasswordReset'))
    }
  }

  return (
    <Container size="1" pt="9" px="4">
      <Card size="3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Flex direction="column" gap="5">
              <Flex direction="column" gap="2">
                <Heading>{i18n.t('auth:forgotPassword')}</Heading>
                <Text color="gray">
                  {i18n.t('auth:forgotPasswordDescription')}
                </Text>
              </Flex>

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormFieldItem>
                    <FormFieldLabel>
                      {i18n.t('auth:phoneNumber')}
                    </FormFieldLabel>

                    <FormFieldControl>
                      <PhoneInput
                        placeholder={i18n.t('auth:phoneNumberPlaceholder')}
                        value={field.value}
                        onChange={field.onChange}
                        inputComponent={TextField.Root}
                      />
                    </FormFieldControl>

                    <FormFieldError />
                  </FormFieldItem>
                )}
              />

              <Flex direction="column" gap="3">
                <Button type="submit" loading={form.formState.isSubmitting}>
                  {i18n.t('auth:sendResetCode')}
                </Button>

                <Button asChild variant="ghost" color="gray">
                  <RouterLink
                    to="/auth/sign-in"
                    search={{
                      phoneNumber: form.getValues('phoneNumber'),
                      redirectTo,
                    }}
                  >
                    {i18n.t('auth:backToSignIn')}
                  </RouterLink>
                </Button>
              </Flex>
            </Flex>
          </form>
        </Form>
      </Card>
    </Container>
  )
}
