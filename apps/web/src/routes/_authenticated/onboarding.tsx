import { zodResolver } from '@hookform/resolvers/zod'
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import { Button, Card, Container, Flex } from '@radix-ui/themes'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
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
import { IconButton } from '../../components/icon-button'
import { TextField } from '../../components/text-field'
import { setPassword } from '../../lib/api/api.gen'
import { authClient } from '../../lib/auth-client'
import i18n from '../../lib/i18n'

export const Route = createFileRoute('/_authenticated/onboarding')({
  validateSearch: z.object({
    redirectTo: z.string().optional(),
  }),
  component: OnboardingPage,
})

const onboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, i18n.t('validation:name.required'))
    .max(100, i18n.t('validation:name.tooLong')),
  password: z
    .string(i18n.t('validation:password.required'))
    .min(1, i18n.t('validation:password.required'))
    .min(8, i18n.t('validation:password.tooShort'))
    .max(128, i18n.t('validation:password.tooLong')),
})

type OnboardingFormValues = z.infer<typeof onboardingSchema>

function OnboardingPage() {
  const navigate = useNavigate()

  const { redirectTo } = Route.useSearch()

  const [hasSetPassword, setHasSetPassword] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: '', password: '' },
  })

  const onSubmit = async ({ name, password }: OnboardingFormValues) => {
    try {
      if (!hasSetPassword) {
        await setPassword({ newPassword: password })
        setHasSetPassword(true)
      }

      const result = await authClient.updateUser({ name })

      if (result.error) {
        toast.error(i18n.t('errors:unableToCompleteOnboarding'))
        return
      }

      await navigate({ href: redirectTo ?? '/' })
    } catch {
      toast.error(i18n.t('errors:unableToCompleteOnboarding'))
    }
  }

  return (
    <Container size="1" pt="9" px="4">
      <Card size="3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Flex direction="column" gap="5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormFieldItem>
                    <FormFieldLabel>{i18n.t('auth:yourName')}</FormFieldLabel>

                    <FormFieldControl>
                      <TextField.Root
                        placeholder={i18n.t('auth:yourNamePlaceholder')}
                        autoComplete="name"
                        {...field}
                      />
                    </FormFieldControl>

                    <FormFieldError />
                  </FormFieldItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormFieldItem>
                    <FormFieldLabel>{i18n.t('auth:password')}</FormFieldLabel>

                    <FormFieldControl>
                      <TextField.Root
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder={i18n.t('auth:passwordPlaceholder')}
                        autoComplete="new-password"
                        {...field}
                        readOnly={hasSetPassword}
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
                            disabled={hasSetPassword}
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
                {i18n.t('common:continue')}
              </Button>
            </Flex>
          </form>
        </Form>
      </Card>
    </Container>
  )
}
