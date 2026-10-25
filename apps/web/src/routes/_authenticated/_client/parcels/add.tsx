import { zodResolver } from '@hookform/resolvers/zod'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Callout, Container, Flex, Strong } from '@radix-ui/themes'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
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
import { ApiError } from '../../../../lib/api/custom-fetch'
import { MANAGER_WHATSAPP_URL } from '../../../../lib/contact'
import i18n from '../../../../lib/i18n'

const SUSPICIOUS_TRACKING_NUMBER_PATTERN = /^\d{6}-\d+$/

export const Route = createFileRoute('/_authenticated/_client/parcels/add')({
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
    .min(1, i18n.t('validation:trackingNumber.required'))
    .refine(
      (value) => !SUSPICIOUS_TRACKING_NUMBER_PATTERN.test(value),
      i18n.t('validation:trackingNumber.suspicious')
    ),
  source: z.string(),
  description: z.string().trim(),
})

type AddParcelFormValues = z.infer<typeof addParcelSchema>

function AddParcelPage() {
  const navigate = useNavigate()
  const [conflictingTrackingNumber, setConflictingTrackingNumber] = useState<
    string | null
  >(null)

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
    setConflictingTrackingNumber(null)

    try {
      await addParcelMutation.mutateAsync({
        trackingNumber,
        description: description || undefined,
      })
      await navigateToParcels({ ignoreBlocker: true, replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const message =
          typeof error.data === 'object' &&
          error.data !== null &&
          'message' in error.data
            ? error.data.message
            : null

        if (message === 'PARCEL_TRACKING_NUMBER_EXISTS') {
          if (form.getValues('trackingNumber') === trackingNumber) {
            setConflictingTrackingNumber(trackingNumber)
          }
          return
        }

        if (message === 'PARCEL_ALREADY_OWNED_BY_CLIENT') {
          const parcelId =
            typeof error.data === 'object' &&
            error.data !== null &&
            'parcelId' in error.data
              ? error.data.parcelId
              : null

          if (typeof parcelId === 'string') {
            await navigate({
              to: '/parcels/$parcelId',
              params: { parcelId },
              ignoreBlocker: true,
            })
            return
          }

          form.setError(
            'trackingNumber',
            { message: i18n.t('parcels:parcelAlreadyInYourList') },
            { shouldFocus: true }
          )
          return
        }
      }

      toast.error(i18n.t('parcels:unableToAddParcel'))
    }
  }

  const managerWhatsAppUrl = conflictingTrackingNumber
    ? `${MANAGER_WHATSAPP_URL}?text=${encodeURIComponent(
        i18n.t('parcels:trackingNumberSupportMessage', {
          trackingNumber: conflictingTrackingNumber,
        })
      )}`
    : MANAGER_WHATSAPP_URL

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
                      onChange={(event) => {
                        field.onChange(event)
                        setConflictingTrackingNumber(null)
                      }}
                    />
                  </FormFieldControl>

                  <FormFieldError />
                </FormFieldItem>
              )}
            />

            {conflictingTrackingNumber && (
              <Callout.Root color="red" role="alert">
                <Callout.Icon>
                  <ExclamationTriangleIcon />
                </Callout.Icon>

                <Callout.Text>
                  <Strong>
                    {i18n.t('parcels:trackingNumberAssignedElsewhere')}
                  </Strong>{' '}
                  {i18n.t('parcels:trackingNumberAssignmentHelp')}
                </Callout.Text>

                <Flex>
                  <Button asChild color="red">
                    <a
                      href={managerWhatsAppUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {i18n.t('parcels:contactManagerOnWhatsApp')}
                    </a>
                  </Button>
                </Flex>
              </Callout.Root>
            )}

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
