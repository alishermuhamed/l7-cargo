import { zodResolver } from '@hookform/resolvers/zod'
import { Container, Flex } from '@radix-ui/themes'
import { useMutation } from '@tanstack/react-query'
import {
  createFileRoute,
  Link as RouterLink,
  useNavigate,
} from '@tanstack/react-router'
import BigNumber from 'bignumber.js'
import { useForm } from 'react-hook-form'
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
import { MoneyTextField } from '../../../../../components/money-text-field'
import { TextField } from '../../../../../components/text-field'
import { UnsavedChangesBlocker } from '../../../../../components/unsaved-changes-blocker'
import {
  updateParcel,
  type UpdateParcelRequestDto,
} from '../../../../../lib/api/api.gen'
import { getParcelQueryOptions } from '../../../../../lib/api/queries'
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
    const initialParcel = await queryClient.ensureQueryData(
      getParcelQueryOptions(parcelId)
    )

    return { initialParcel }
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
})

type EditAdminParcelFormValues = z.infer<typeof editAdminParcelSchema>

function EditAdminParcelPage() {
  const navigate = useNavigate()

  const { initialParcel } = Route.useLoaderData()

  const form = useForm<EditAdminParcelFormValues>({
    resolver: zodResolver(editAdminParcelSchema),
    defaultValues: {
      weightKg: initialParcel.weightKg ?? '',
      deliveryFee: initialParcel.deliveryFee ?? '',
    },
  })

  const editParcelMutation = useMutation({
    mutationFn: (dto: UpdateParcelRequestDto) =>
      updateParcel(initialParcel.id, dto),
  })

  const onSubmit = async ({
    weightKg,
    deliveryFee,
  }: EditAdminParcelFormValues) => {
    try {
      await editParcelMutation.mutateAsync({
        weightKg: weightKg === '' ? null : new BigNumber(weightKg).toFixed(),
        deliveryFee:
          deliveryFee === '' ? null : normalizeMoneyAmount(deliveryFee),
      })

      await navigate({
        to: '/admin/parcels/$parcelId',
        params: { parcelId: initialParcel.id },
        ignoreBlocker: true,
        replace: true,
      })
    } catch {
      toast.error(i18n.t('parcels:unableToEditParcel'))
    }
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
