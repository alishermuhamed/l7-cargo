import { zodResolver } from '@hookform/resolvers/zod'
import { Card, Container, Flex, TextField } from '@radix-ui/themes'
import {
  createFileRoute,
  Link as RouterLink,
  useNavigate,
} from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'

import { Button } from '../../../../components/button'
import {
  Form,
  FormField,
  FormFieldControl,
  FormFieldError,
  FormFieldItem,
  FormFieldLabel,
} from '../../../../components/form'
import { UnsavedChangesBlocker } from '../../../../components/unsaved-changes-blocker'
import { authClient } from '../../../../lib/auth-client'
import i18n from '../../../../lib/i18n'
import { formatPhoneNumber } from '../../../../lib/phone-number'

export const Route = createFileRoute('/_authenticated/_client-menu/profile/edit')({
  staticData: {
    title: i18n.t('profile:editProfile'),
    fallbackTo: '/profile',
  },
  component: EditProfilePage,
})

const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, i18n.t('validation:name.required'))
    .max(100, i18n.t('validation:name.tooLong')),
  phoneNumber: z.string(),
})

type EditProfileFormValues = z.infer<typeof editProfileSchema>

function EditProfilePage() {
  const navigate = useNavigate()

  const { session } = Route.useRouteContext()

  const phoneNumber = formatPhoneNumber(session.user.phoneNumber ?? '')

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: session.user.name,
      phoneNumber,
    },
  })

  const onSubmit = async ({ name }: EditProfileFormValues) => {
    try {
      const result = await authClient.updateUser({ name })

      if (result.error) {
        toast.error(i18n.t('profile:unableToUpdateProfile'))
        return
      }

      await navigate({ to: '/profile', ignoreBlocker: true })
    } catch {
      toast.error(i18n.t('profile:unableToUpdateProfile'))
    }
  }

  return (
    <Container size="1" p="4">
      <Card size="3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Flex direction="column" gap="4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormFieldItem>
                    <FormFieldLabel>{i18n.t('profile:name')}</FormFieldLabel>

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
                name="phoneNumber"
                render={({ field }) => (
                  <FormFieldItem>
                    <FormFieldLabel>
                      {i18n.t('auth:phoneNumber')}
                    </FormFieldLabel>

                    <FormFieldControl>
                      <TextField.Root disabled {...field} />
                    </FormFieldControl>

                    <FormFieldError />
                  </FormFieldItem>
                )}
              />

              <Flex
                direction={{ initial: 'column-reverse', xs: 'row' }}
                justify="end"
                gap="3"
              >
                <Button asChild variant="soft" color="gray">
                  <RouterLink to="/profile" replace>
                    {i18n.t('common:cancel')}
                  </RouterLink>
                </Button>

                <Button type="submit" loading={form.formState.isSubmitting}>
                  {i18n.t('common:save')}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Form>
      </Card>

      <UnsavedChangesBlocker form={form} />
    </Container>
  )
}
