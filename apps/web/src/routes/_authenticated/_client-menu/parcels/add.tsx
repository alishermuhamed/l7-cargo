import { zodResolver } from '@hookform/resolvers/zod'
import { Container, Flex } from '@radix-ui/themes'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
import { TextField } from '../../../../components/text-field'
import { UnsavedChangesBlocker } from '../../../../components/unsaved-changes-blocker'
import {
  createParcel,
  type CreateParcelRequestDto,
} from '../../../../lib/api/api.gen'
import i18n from '../../../../lib/i18n'

export const Route = createFileRoute('/_authenticated/_client-menu/parcels/add')({
  staticData: {
    title: i18n.t('parcels:addParcel'),
    fallbackTo: '/parcels',
  },
  component: AddParcelPage,
})

const addParcelSchema = z.object({
  trackingNumber: z
    .string()
    .trim()
    .min(1, i18n.t('validation:trackingNumber.required')),
  source: z.string(),
  description: z.string().trim(),
})

type AddParcelFormValues = z.infer<typeof addParcelSchema>

function AddParcelPage() {
  const navigate = useNavigate()

  const form = useForm<AddParcelFormValues>({
    resolver: zodResolver(addParcelSchema),
    defaultValues: {
      trackingNumber: '',
      source: '',
      description: '',
    },
  })

  const addParcelMutation = useMutation({
    mutationFn: (dto: CreateParcelRequestDto) => createParcel(dto),
  })

  const navigateToParcels = (params?: {
    ignoreBlocker?: boolean
    replace?: boolean
  }) =>
    navigate({
      to: '/parcels',
      ignoreBlocker: params?.ignoreBlocker ?? false,
      replace: params?.replace,
    })

  const onSubmit = async ({
    trackingNumber,
    description,
  }: AddParcelFormValues) => {
    try {
      await addParcelMutation.mutateAsync({
        trackingNumber,
        description: description || undefined,
      })
      await navigateToParcels({ ignoreBlocker: true, replace: true })
    } catch {
      toast.error(i18n.t('parcels:unableToAddParcel'))
    }
  }

  return (
    <Container p="4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            <FormField
              control={form.control}
              name="trackingNumber"
              render={({ field }) => (
                <FormFieldItem>
                  <FormFieldLabel>
                    {i18n.t('parcels:trackingNumber')} *
                  </FormFieldLabel>

                  <FormFieldControl>
                    <TextField.Root
                      placeholder={i18n.t('parcels:trackingNumberPlaceholder')}
                      autoComplete="off"
                      {...field}
                    />
                  </FormFieldControl>

                  <FormFieldError />
                </FormFieldItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormFieldItem>
                  <FormFieldLabel>
                    {i18n.t('parcels:description')}
                  </FormFieldLabel>

                  <FormFieldControl>
                    <TextField.Root
                      placeholder={i18n.t('parcels:descriptionPlaceholder')}
                      autoComplete="off"
                      {...field}
                    />
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
              <Button
                type="button"
                variant="soft"
                color="gray"
                onClick={() => navigateToParcels()}
              >
                {i18n.t('common:cancel')}
              </Button>

              <Button type="submit" loading={form.formState.isSubmitting}>
                {i18n.t('common:add')}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Form>

      <UnsavedChangesBlocker form={form} />
    </Container>
  )
}
