import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, Container, Flex } from '@radix-ui/themes'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
})

type OnboardingFormValues = z.infer<typeof onboardingSchema>

function OnboardingPage() {
  const navigate = useNavigate()

  const { redirectTo } = Route.useSearch()

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: '' },
  })

  const onSubmit = async ({ name }: OnboardingFormValues) => {
    try {
      const result = await authClient.updateUser({ name })

      if (result.error) {
        toast.error(i18n.t('errors:unableToSaveYourName'))
        return
      }

      await navigate({ href: redirectTo ?? '/' })
    } catch {
      toast.error(i18n.t('errors:unableToSaveYourName'))
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
