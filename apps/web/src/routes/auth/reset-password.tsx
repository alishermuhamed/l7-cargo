import { zodResolver } from '@hookform/resolvers/zod'
import {
  EyeClosedIcon,
  EyeOpenIcon,
  Pencil1Icon,
  ReloadIcon,
} from '@radix-ui/react-icons'
import { Box, Card, Container, Flex, Heading, Text } from '@radix-ui/themes'
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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
import { IconButton } from '../../components/icon-button'
import { TextField } from '../../components/text-field'
import { authClient } from '../../lib/auth-client'
import i18n from '../../lib/i18n'
import { formatPhoneNumber } from '../../lib/phone-number'

export const Route = createFileRoute('/auth/reset-password')({
  validateSearch: z.object({
    phoneNumber: z.string().trim().min(1).catch(''),
    redirectTo: z.string().optional(),
  }),
  beforeLoad: ({ search }) => {
    if (!search.phoneNumber) {
      throw redirect({
        to: '/auth/forgot-password',
        search: { redirectTo: search.redirectTo },
      })
    }
  },
  component: ResetPasswordPage,
})

const resetPasswordSchema = z.object({
  code: z
    .string(i18n.t('validation:otpCode.required'))
    .trim()
    .min(1, i18n.t('validation:otpCode.required'))
    .regex(/^\d{6}$/, i18n.t('validation:otpCode.invalid')),
  password: z
    .string(i18n.t('validation:password.required'))
    .min(1, i18n.t('validation:password.required'))
    .min(8, i18n.t('validation:password.tooShort'))
    .max(128, i18n.t('validation:password.tooLong')),
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

const RESEND_OTP_DELAY_SECONDS = 60

function ResetPasswordPage() {
  const navigate = useNavigate()
  const { phoneNumber, redirectTo } = Route.useSearch()

  const [secondsUntilResend, setSecondsUntilResend] = useState(
    RESEND_OTP_DELAY_SECONDS
  )
  const [isResending, setIsResending] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', password: '' },
  })

  useEffect(() => {
    if (secondsUntilResend === 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsUntilResend((currentSecondsUntilResend) =>
        Math.max(currentSecondsUntilResend - 1, 0)
      )
    }, 1000)

    return () => window.clearTimeout(timeoutId)
  }, [secondsUntilResend])

  const onSubmit = async ({ code, password }: ResetPasswordFormValues) => {
    try {
      const result = await authClient.phoneNumber.resetPassword({
        otp: code,
        phoneNumber,
        newPassword: password,
      })

      if (result.error) {
        if (result.error.status === 403) {
          setSecondsUntilResend(0)
          toast.error(i18n.t('errors:tooManyResetAttempts'))
          return
        }

        toast.error(i18n.t('errors:invalidOrExpiredCode'))
        return
      }

      toast.success(i18n.t('auth:passwordResetSuccess'))
      await navigate({
        to: '/auth/sign-in',
        search: { phoneNumber, redirectTo },
      })
    } catch {
      toast.error(i18n.t('errors:unableToResetPassword'))
    }
  }

  const onResend = async () => {
    if (secondsUntilResend > 0) {
      return
    }

    try {
      setIsResending(true)

      const result = await authClient.phoneNumber.requestPasswordReset({
        phoneNumber,
      })

      if (result.error) {
        toast.error(i18n.t('errors:unableToRequestPasswordReset'))
        return
      }

      form.resetField('code')
      setSecondsUntilResend(RESEND_OTP_DELAY_SECONDS)
    } catch {
      toast.error(i18n.t('errors:unableToRequestPasswordReset'))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Container size="1" pt="9" px="4">
      <Card size="3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Flex direction="column" gap="5">
              <Heading>{i18n.t('auth:resetPassword')}</Heading>

              <Flex direction="column" gap="2">
                <Text as="p">{i18n.t('auth:resetCodeSentToNumber')}</Text>

                <Flex align="center" gap="4">
                  <Text as="p">{formatPhoneNumber(phoneNumber)}</Text>

                  <Button asChild variant="ghost" color="gray" size="1">
                    <RouterLink
                      to="/auth/forgot-password"
                      search={{ phoneNumber, redirectTo }}
                    >
                      <Pencil1Icon />
                      {i18n.t('common:edit')}
                    </RouterLink>
                  </Button>
                </Flex>

                <Text as="p" size="2" color="gray">
                  {i18n.t('auth:codeDeliveryHint')}
                </Text>
              </Flex>

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormFieldItem>
                    <FormFieldLabel>{i18n.t('auth:otpCode')}</FormFieldLabel>

                    <FormFieldControl>
                      <TextField.Root
                        placeholder={i18n.t('auth:otpCodePlaceholder')}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        {...field}
                      />
                    </FormFieldControl>

                    <FormFieldError />
                  </FormFieldItem>
                )}
              />

              <Box>
                {secondsUntilResend > 0 ? (
                  <Text size="2" color="gray">
                    {i18n.t('auth:resendCodeIn', {
                      seconds: secondsUntilResend,
                    })}
                  </Text>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    color="gray"
                    size="1"
                    onClick={onResend}
                    loading={isResending}
                  >
                    <ReloadIcon />
                    {i18n.t('auth:resendCode')}
                  </Button>
                )}
              </Box>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormFieldItem>
                    <FormFieldLabel>
                      {i18n.t('auth:newPassword')}
                    </FormFieldLabel>

                    <FormFieldControl>
                      <TextField.Root
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder={i18n.t('auth:newPasswordPlaceholder')}
                        autoComplete="new-password"
                        {...field}
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
                              setIsPasswordVisible((isVisible) => !isVisible)
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

              <Button type="submit" loading={form.formState.isSubmitting}>
                {i18n.t('auth:resetPassword')}
              </Button>
            </Flex>
          </form>
        </Form>
      </Card>
    </Container>
  )
}
