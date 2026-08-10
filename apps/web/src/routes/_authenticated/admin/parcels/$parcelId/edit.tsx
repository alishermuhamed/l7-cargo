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

import { Button } from '../../../../../components/button'
import {
  Form,
  FormField,
  FormFieldControl,
  FormFieldError,
  FormFieldItem,
  FormFieldLabel,
} from '../../../../../components/form'
import { IconButton } from '../../../../../components/icon-button'
import { MoneyTextField } from '../../../../../components/money-text-field'
import { TextField } from '../../../../../components/text-field'
import { UnsavedChangesBlocker } from '../../../../../components/unsaved-changes-blocker'
import {
  ParcelStatusHistory,
  ParcelStatusHistoryItem,
} from '../../../../../features/parcels/components/parcel-status-history/parcel-status-history'
import { PARCEL_STATUS_LABELS } from '../../../../../features/parcels/lib/parcel-status-labels'
import {
  ParcelStatus,
  putParcelStatusHistory,
  type PutParcelStatusHistoryRequestDto,
  updateParcel,
  type UpdateParcelRequestDto,
} from '../../../../../lib/api/api.gen'
import {
  getParcelQueryOptions,
  getParcelStatusHistoryQueryOptions,
} from '../../../../../lib/api/queries'
import i18n from '../../../../../lib/i18n'
import {
  isValidMoneyAmount,
  normalizeMoneyAmount,
} from '../../../../../lib/money'

const WEIGHT_KG_PATTERN = /^(?:0|[1-9]\d{0,3})(?:\.\d{1,3})?$/

export const Route = createFileRoute(
  '/_authenticated/admin/parcels/$parcelId/edit'
)({
  staticData: {
    title: i18n.t('parcels:editParcel'),
    fallbackTo: '/admin/parcels',
  },
  loader: async ({ context: { queryClient }, params: { parcelId } }) => {
    const [initialParcel, initialStatusHistory] = await Promise.all([
      queryClient.ensureQueryData(getParcelQueryOptions(parcelId)),
      queryClient.ensureQueryData(getParcelStatusHistoryQueryOptions(parcelId)),
    ])

    return { initialParcel, initialStatusHistory }
  },
  component: EditAdminParcelPage,
})

const editAdminParcelSchema = z.object({
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
  statusHistory: z
    .object({
      status: z.enum(ParcelStatus),
      achievedAt: z.union([z.iso.date(), z.literal('')]),
    })
    .array(),
})

type EditAdminParcelFormValues = z.infer<typeof editAdminParcelSchema>

function EditAdminParcelPage() {
  const navigate = useNavigate()

  const { initialParcel, initialStatusHistory } = Route.useLoaderData()

  const form = useForm<EditAdminParcelFormValues>({
    resolver: zodResolver(editAdminParcelSchema),
    defaultValues: {
      weightKg: initialParcel.weightKg ?? '',
      deliveryFee: initialParcel.deliveryFee ?? '',
      statusHistory: Object.values(ParcelStatus).map((status) => {
        const existingEntry = initialStatusHistory.find(
          (item) => item.status === status
        )

        return { status, achievedAt: existingEntry?.achievedAt ?? '' }
      }),
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

  const updateParcelMutation = useMutation({
    mutationFn: (dto: UpdateParcelRequestDto) =>
      updateParcel(initialParcel.id, dto),
  })

  const putParcelStatusHistoryMutation = useMutation({
    mutationFn: (dto: PutParcelStatusHistoryRequestDto) =>
      putParcelStatusHistory(initialParcel.id, dto),
  })

  const onSubmit = async ({
    weightKg,
    deliveryFee,
    statusHistory,
  }: EditAdminParcelFormValues) => {
    try {
      await updateParcelMutation.mutateAsync({
        weightKg: weightKg === '' ? null : new BigNumber(weightKg).toFixed(),
        deliveryFee:
          deliveryFee === '' ? null : normalizeMoneyAmount(deliveryFee),
      })
    } catch {
      toast.error(i18n.t('parcels:unableToEditParcel'))
      return
    }

    try {
      await putParcelStatusHistoryMutation.mutateAsync({
        entries: statusHistory.flatMap(({ status, achievedAt }) =>
          achievedAt === '' ? [] : [{ status, achievedAt }]
        ),
      })
    } catch {
      toast.error(i18n.t('parcels:unableToUpdateStatusHistory'))
    }

    await navigate({
      to: '/admin/parcels/$parcelId',
      params: { parcelId: initialParcel.id },
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
                <RouterLink
                  to="/admin/parcels/$parcelId"
                  params={{ parcelId: initialParcel.id }}
                  replace
                >
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

      <UnsavedChangesBlocker form={form} />
    </Container>
  )
}
