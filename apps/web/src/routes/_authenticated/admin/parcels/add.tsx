import { zodResolver } from '@hookform/resolvers/zod'
import { Cross1Icon } from '@radix-ui/react-icons'
import { Box, Container, Flex, Heading } from '@radix-ui/themes'
import { useMutation } from '@tanstack/react-query'
import {
  createFileRoute,
  Link as RouterLink,
  useNavigate,
} from '@tanstack/react-router'
import BigNumber from 'bignumber.js'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
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
import { IconButton } from '../../../../components/icon-button'
import { MoneyTextField } from '../../../../components/money-text-field'
import { TextField } from '../../../../components/text-field'
import { UnsavedChangesBlocker } from '../../../../components/unsaved-changes-blocker'
import {
  ParcelStatusHistory,
  ParcelStatusHistoryItem,
} from '../../../../features/parcels/components/parcel-status-history/parcel-status-history'
import { PARCEL_STATUS_LABELS } from '../../../../features/parcels/lib/parcel-status-labels'
import {
  createParcel,
  type CreateParcelRequestDto,
  ParcelStatus,
  putParcelStatusHistory,
  type PutParcelStatusHistoryRequestDto,
} from '../../../../lib/api/api.gen'
import { ApiError } from '../../../../lib/api/custom-fetch'
import { normalizeDecimalSeparator } from '../../../../lib/decimal'
import i18n from '../../../../lib/i18n'
import { isValidMoneyAmount, normalizeMoneyAmount } from '../../../../lib/money'

const SUSPICIOUS_TRACKING_NUMBER_PATTERN = /^\d{6}-\d+$/
const WEIGHT_KG_PATTERN = /^(?:0|[1-9]\d{0,3})(?:[.,]\d{1,3})?$/

export const Route = createFileRoute('/_authenticated/admin/parcels/add')({
  staticData: {
    title: i18n.t('parcels:addParcel'),
    fallbackTo: '/admin/parcels',
  },
  component: AddAdminParcelPage,
})

const addAdminParcelSchema = z.object({
  clientCode: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, i18n.t('parcels:invalidClientCode')),
  trackingNumber: z
    .string()
    .trim()
    .min(1, i18n.t('validation:trackingNumber.required'))
    .refine(
      (value) => !SUSPICIOUS_TRACKING_NUMBER_PATTERN.test(value),
      i18n.t('validation:trackingNumber.suspicious')
    ),
  weightKg: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || WEIGHT_KG_PATTERN.test(value),
      i18n.t('validation:weight.invalid')
    ),
  deliveryFee: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || isValidMoneyAmount(value),
      i18n.t('validation:deliveryFee.invalid')
    ),
  comments: z.string().trim(),
  statusHistory: z
    .object({
      status: z.enum(ParcelStatus),
      achievedAt: z.union([z.iso.date(), z.literal('')]),
    })
    .array(),
})

type AddAdminParcelFormValues = z.infer<typeof addAdminParcelSchema>

function AddAdminParcelPage() {
  const navigate = useNavigate()

  const form = useForm<AddAdminParcelFormValues>({
    resolver: zodResolver(addAdminParcelSchema),
    defaultValues: {
      clientCode: '',
      trackingNumber: '',
      weightKg: '',
      deliveryFee: '',
      comments: '',
      statusHistory: Object.values(ParcelStatus).map((status) => ({
        status,
        achievedAt: '',
      })),
    },
  })

  const statusHistory = useFieldArray({
    control: form.control,
    name: 'statusHistory',
  })

  const watchedStatusHistory = useWatch({
    control: form.control,
    name: 'statusHistory',
  })

  const controlledStatusHistory = statusHistory.fields.map((field, index) => ({
    ...field,
    ...watchedStatusHistory[index],
  }))

  const createParcelMutation = useMutation({
    mutationFn: (dto: CreateParcelRequestDto) => createParcel(dto),
  })

  const putParcelStatusHistoryMutation = useMutation({
    mutationFn: ({
      parcelId,
      dto,
    }: {
      parcelId: string
      dto: PutParcelStatusHistoryRequestDto
    }) => putParcelStatusHistory(parcelId, dto),
  })

  const onSubmit = async ({
    clientCode,
    trackingNumber,
    weightKg,
    deliveryFee,
    comments,
    statusHistory,
  }: AddAdminParcelFormValues) => {
    let parcelId: string

    try {
      const parcel = await createParcelMutation.mutateAsync({
        clientCode: Number(clientCode),
        trackingNumber,
        weightKg:
          weightKg === ''
            ? undefined
            : new BigNumber(normalizeDecimalSeparator(weightKg)).toFixed(),
        deliveryFee:
          deliveryFee === '' ? undefined : normalizeMoneyAmount(deliveryFee),
        comments: comments === '' ? undefined : comments,
      })
      parcelId = parcel.id
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        form.setError(
          'trackingNumber',
          { message: i18n.t('validation:trackingNumber.duplicate') },
          { shouldFocus: true }
        )
        return
      }

      toast.error(i18n.t('parcels:unableToAddParcel'))
      return
    }

    const entries = statusHistory.flatMap(({ status, achievedAt }) =>
      achievedAt === '' ? [] : [{ status, achievedAt }]
    )

    if (entries.length > 0) {
      try {
        await putParcelStatusHistoryMutation.mutateAsync({
          parcelId,
          dto: { entries },
        })
      } catch {
        toast.error(i18n.t('parcels:unableToUpdateStatusHistory'))
      }
    }

    await navigate({
      to: '/admin/parcels/$parcelId',
      params: { parcelId },
      ignoreBlocker: true,
      replace: true,
    })
  }

  return (
    <Container p="4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            <FormField
              control={form.control}
              name="clientCode"
              render={({ field }) => (
                <FormFieldItem>
                  <FormFieldLabel>
                    {i18n.t('parcels:clientCode')} *
                  </FormFieldLabel>

                  <FormFieldControl>
                    <TextField.Root
                      placeholder={i18n.t('parcels:clientCodePlaceholder')}
                      autoComplete="off"
                      inputMode="numeric"
                      {...field}
                    />
                  </FormFieldControl>

                  <FormFieldError />
                </FormFieldItem>
              )}
            />

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
              name="weightKg"
              render={({ field }) => (
                <FormFieldItem>
                  <FormFieldLabel>{i18n.t('parcels:weight')}</FormFieldLabel>

                  <FormFieldControl>
                    <TextField.Root
                      placeholder={i18n.t('parcels:weightPlaceholder')}
                      autoComplete="off"
                      inputMode="decimal"
                      {...field}
                    />
                  </FormFieldControl>

                  <FormFieldError />
                </FormFieldItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryFee"
              render={({ field }) => (
                <FormFieldItem>
                  <FormFieldLabel>
                    {i18n.t('parcels:deliveryFee')}
                  </FormFieldLabel>

                  <FormFieldControl>
                    <MoneyTextField
                      currency="KZT"
                      placeholder={i18n.t('parcels:deliveryFeePlaceholder')}
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
              name="comments"
              render={({ field }) => (
                <FormFieldItem>
                  <FormFieldLabel>{i18n.t('parcels:comments')}</FormFieldLabel>

                  <FormFieldControl>
                    <TextField.Root autoComplete="off" {...field} />
                  </FormFieldControl>

                  <FormFieldError />
                </FormFieldItem>
              )}
            />

            <Heading size="4">{i18n.t('parcels:statusHistory')}</Heading>

            <ParcelStatusHistory>
              {controlledStatusHistory.map((item, index) => (
                <ParcelStatusHistoryItem
                  key={item.id}
                  isAchieved={!!item.achievedAt}
                >
                  <FormField
                    control={form.control}
                    name={`statusHistory.${index}.achievedAt`}
                    render={({ field }) => (
                      <FormFieldItem mb="3">
                        <FormFieldLabel>
                          {PARCEL_STATUS_LABELS[item.status]}
                        </FormFieldLabel>

                        <Flex align="center" gap="3">
                          <Box asChild width="200px">
                            <FormFieldControl>
                              <TextField.Root type="date" {...field} />
                            </FormFieldControl>
                          </Box>

                          {field.value && (
                            <IconButton
                              type="button"
                              size="1"
                              variant="ghost"
                              onClick={() => field.onChange('')}
                            >
                              <Cross1Icon />
                            </IconButton>
                          )}
                        </Flex>

                        <FormFieldError />
                      </FormFieldItem>
                    )}
                  />
                </ParcelStatusHistoryItem>
              ))}
            </ParcelStatusHistory>

            <Flex
              direction={{ initial: 'column-reverse', xs: 'row' }}
              justify="end"
              gap="3"
            >
              <Button asChild variant="soft" color="gray">
                <RouterLink to="/admin/parcels" replace>
                  {i18n.t('common:cancel')}
                </RouterLink>
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
