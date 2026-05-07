import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, Container, Flex, Heading } from '@radix-ui/themes'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import PhoneInput from 'react-phone-number-input/input'
import { z } from 'zod'

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

export const Route = createFileRoute('/auth/sign-in')({
  validateSearch: z.object({
    phoneNumber: z.string().trim().optional(),
    redirectTo: z.string().optional(),
  }),
  component: SignInPage,
})

const signInSchema = z.object({
  phoneNumber: z
    .string(i18n.t('validation:phoneNumber.required'))
    .trim()
    .min(1, i18n.t('validation:phoneNumber.required')),
})

type SignInFormValues = z.infer<typeof signInSchema>

function SignInPage() {
  const navigate = useNavigate()

  const { phoneNumber, redirectTo } = Route.useSearch()

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { phoneNumber: phoneNumber ?? '' },
  })

  const onSubmit = async ({ phoneNumber }: SignInFormValues) => {
    try {
      const result = await authClient.phoneNumber.sendOtp({
        phoneNumber,
      })

      if (result.error) {
        toast.error(i18n.t('errors:unableToSendVerificationCode'))
        return
      }

      await navigate({
        to: '/auth/verify',
        search: { phoneNumber, redirectTo },
      })
    } catch {
      toast.error(i18n.t('errors:unableToSendVerificationCode'))
    }
  }

  return (
    <Container size="1" pt="9" px="4">
      <Card size="3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Flex direction="column" gap="5">
              <Heading>{i18n.t('auth:signIn')}</Heading>

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

              <Button type="submit" loading={form.formState.isSubmitting}>
                {i18n.t('auth:signIn')}
              </Button>
            </Flex>
          </form>
        </Form>
      </Card>
    </Container>
  )
}
