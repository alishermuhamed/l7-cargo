import { zodResolver } from '@hookform/resolvers/zod'
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import {
  Card,
  Container,
  Flex,
  Heading,
  Link as RadixLink,
} from '@radix-ui/themes'
import {
  createFileRoute,
  Link as RouterLink,
  useNavigate,
} from '@tanstack/react-router'
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
import { IconButton } from '../../components/icon-button'
import { TextField } from '../../components/text-field'
import { getSignInMethod, SignInMethod } from '../../lib/api/api.gen'
import { authClient } from '../../lib/auth-client'
import i18n from '../../lib/i18n'
import { phoneNumberSchema } from '../../lib/phone-number-schema'

export const Route = createFileRoute('/auth/sign-in')({
  validateSearch: z.object({
    phoneNumber: phoneNumberSchema.optional().catch(undefined),
    redirectTo: z.string().optional(),
  }),
  component: SignInPage,
})

const signInSchema = z.object({
  phoneNumber: phoneNumberSchema,
  password: z.string().optional(),
})

type SignInFormValues = z.infer<typeof signInSchema>

function SignInPage() {
  const navigate = useNavigate()

  const { phoneNumber, redirectTo } = Route.useSearch()

  const [isPasswordRequired, setIsPasswordRequired] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { phoneNumber: phoneNumber ?? '' },
  })

  const onSubmit = async ({ phoneNumber, password }: SignInFormValues) => {
    if (isPasswordRequired) {
      if (!password) {
        form.setError('password', {
          message: i18n.t('validation:password.required'),
        })
        return
      }

      try {
        const result = await authClient.signIn.phoneNumber({
          phoneNumber,
          password,
        })

        if (result.error) {
          toast.error(i18n.t('errors:invalidPhoneNumberOrPassword'))
          return
        }

        await navigate({ to: redirectTo ?? '/' })
      } catch {
        toast.error(i18n.t('errors:invalidPhoneNumberOrPassword'))
      }

      return
    }

    try {
      const { method } = await getSignInMethod({ phoneNumber })

      if (method === SignInMethod.password) {
        setIsPasswordRequired(true)
        return
      }
    } catch {
      toast.error(i18n.t('errors:unableToSignIn'))
      return
    }

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
                        onChange={(value) => {
                          field.onChange(value)

                          if (isPasswordRequired) {
                            setIsPasswordRequired(false)
                            setIsPasswordVisible(false)
                            form.resetField('password')
                          }
                        }}
                        inputComponent={TextField.Root}
                      />
                    </FormFieldControl>

                    <FormFieldError />
                  </FormFieldItem>
                )}
              />

              {isPasswordRequired && (
                <Flex direction="column" gap="2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormFieldItem>
                        <FormFieldLabel>
                          {i18n.t('auth:password')}
                        </FormFieldLabel>

                        <FormFieldControl>
                          <TextField.Root
                            type={isPasswordVisible ? 'text' : 'password'}
                            placeholder={i18n.t('auth:passwordPlaceholder')}
                            autoComplete="current-password"
                            {...field}
                            value={field.value ?? ''}
                          >
                            <TextField.Slot side="right">
                              <IconButton
                                type="button"
                                size="1"
                                variant="ghost"
                                color="gray"
                                tooltip={i18n.t(
                                  isPasswordVisible
                                    ? 'auth:hidePassword'
                                    : 'auth:showPassword'
                                )}
                                aria-label={i18n.t(
                                  isPasswordVisible
                                    ? 'auth:hidePassword'
                                    : 'auth:showPassword'
                                )}
                                onClick={() =>
                                  setIsPasswordVisible(
                                    (isVisible) => !isVisible
                                  )
                                }
                              >
                                {isPasswordVisible ? (
                                  <EyeClosedIcon />
                                ) : (
                                  <EyeOpenIcon />
                                )}
                              </IconButton>
                            </TextField.Slot>
                          </TextField.Root>
                        </FormFieldControl>

                        <FormFieldError />
                      </FormFieldItem>
                    )}
                  />

                  <RadixLink asChild size="2">
                    <RouterLink
                      to="/auth/forgot-password"
                      search={{
                        phoneNumber: form.getValues('phoneNumber'),
                        redirectTo,
                      }}
                    >
                      {i18n.t('auth:forgotPassword')}
                    </RouterLink>
                  </RadixLink>
                </Flex>
              )}

              <Button type="submit" loading={form.formState.isSubmitting}>
                {i18n.t(isPasswordRequired ? 'auth:signIn' : 'common:continue')}
              </Button>
            </Flex>
          </form>
        </Form>
      </Card>
    </Container>
  )
}
