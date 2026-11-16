import { zodResolver } from '@hookform/resolvers/zod'
import { Callout, Card, Container, Flex, Heading, Text } from '@radix-ui/themes'
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { useState } from 'react'
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
import { phoneNumberSchema } from '../../lib/phone-number-schema'

export const Route = createFileRoute('/auth/forgot-password')({
  validateSearch: z.object({
    phoneNumber: phoneNumberSchema.optional().catch(undefined),
    redirectTo: z.string().optional(),
  }),
  component: ForgotPasswordPage,
})

const forgotPasswordSchema = z.object({
  phoneNumber: phoneNumberSchema,
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

function ForgotPasswordPage() {
  const [confirmedPhoneNumber, setConfirmedPhoneNumber] = useState<string>()
  const { phoneNumber, redirectTo } = Route.useSearch()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { phoneNumber: phoneNumber ?? '' },
  })

  const onSubmit = async ({ phoneNumber }: ForgotPasswordFormValues) => {
    setConfirmedPhoneNumber(undefined)
    try {
      const result = await authClient.phoneNumber.requestPasswordReset({
        phoneNumber,
      })

      if (result.error) {
        if (result.error.status === 404) {
          form.setError('phoneNumber', {
            message: i18n.t('auth:recoveryAccountNotFound'),
          })
          return
        }
        toast.error(i18n.t('errors:unableToRequestPasswordReset'))
        return
      }

      setConfirmedPhoneNumber(phoneNumber)
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
                        onChange={(value) => {
                          setConfirmedPhoneNumber(undefined)
                          field.onChange(value)
                        }}
                        disabled={form.formState.isSubmitting}
                        inputComponent={TextField.Root}
                      />
                    </FormFieldControl>

                    <FormFieldError />
                  </FormFieldItem>
                )}
              />

              {confirmedPhoneNumber && (
                <Callout.Root role="status">
                  <Callout.Text>
                    {i18n.t('auth:recoveryContactManager')}
                  </Callout.Text>
                </Callout.Root>
              )}

              <Flex direction="column" gap="3">
                <Button type="submit" loading={form.formState.isSubmitting}>
                  {i18n.t('common:continue')}
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
