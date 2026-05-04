import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil1Icon, ReloadIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
} from '@radix-ui/themes'
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
import { formatPhoneNumber } from '../../lib/phone-number'

export const Route = createFileRoute('/auth/verify')({
  validateSearch: z.object({
    phoneNumber: z.string().trim().min(1).catch(''),
    redirectTo: z.string().optional(),
  }),
  beforeLoad: ({ search }) => {
    if (!search.phoneNumber) {
      throw redirect({
        to: '/auth/sign-in',
        search: { redirectTo: search.redirectTo },
      })
    }
  },
  component: VerifyPage,
})

const verifySchema = z.object({
  code: z
    .string(i18n.t('validation:otpCode.required'))
    .trim()
    .min(1, i18n.t('validation:otpCode.required')),
})

type VerifyFormValues = z.infer<typeof verifySchema>

const RESEND_OTP_DELAY_SECONDS = 60

function VerifyPage() {
  const navigate = useNavigate()
  const { phoneNumber, redirectTo } = Route.useSearch()
  const [secondsUntilResend, setSecondsUntilResend] = useState(
    RESEND_OTP_DELAY_SECONDS
  )
  const [isResending, setIsResending] = useState(false)

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
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

  const onSubmit = async ({ code }: VerifyFormValues) => {
    try {
      const result = await authClient.phoneNumber.verify({
        code,
        phoneNumber,
      })

      if (result.error) {
        toast.error(i18n.t('errors:invalidOrExpiredCode'))
        return
      }

      await navigate({ href: redirectTo ?? '/' })
    } catch {
      toast.error(i18n.t('errors:invalidOrExpiredCode'))
    }
  }

  const onResend = async () => {
    if (secondsUntilResend > 0) {
      return
    }

    try {
      setIsResending(true)

      const result = await authClient.phoneNumber.sendOtp({
        phoneNumber,
      })

      if (result.error) {
        toast.error(i18n.t('errors:unableToSendVerificationCode'))
        return
      }

      form.reset({ code: '' })
      setSecondsUntilResend(RESEND_OTP_DELAY_SECONDS)
    } catch {
      toast.error(i18n.t('errors:unableToSendVerificationCode'))
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
              <Heading>{i18n.t('auth:verify')}</Heading>

              <Flex direction="column" gap="2">
                <Text as="p">{i18n.t('auth:codeSentToNumber')}</Text>

                <Flex align="center" gap="4">
                  <Text as="p">{formatPhoneNumber(phoneNumber)}</Text>

                  <Button asChild variant="ghost" color="gray" size="1">
                    <RouterLink
                      to="/auth/sign-in"
                      search={{ phoneNumber, redirectTo }}
                    >
                      <Pencil1Icon />
                      {i18n.t('common:edit')}
                    </RouterLink>
                  </Button>
                </Flex>
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

              <Button type="submit" loading={form.formState.isSubmitting}>
                {i18n.t('auth:verify')}
              </Button>
            </Flex>
          </form>
        </Form>
      </Card>
    </Container>
  )
}
