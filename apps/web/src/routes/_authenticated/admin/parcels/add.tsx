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

import { Button } from '../../../../components/button'
import {
  Form,
  FormField,
  FormFieldControl,
  FormFieldError,
  FormFieldItem,
  FormFieldLabel,
} from '../../../../components/form'
import { MoneyTextField } from '../../../../components/money-text-field'
import { TextField } from '../../../../components/text-field'
import { UnsavedChangesBlocker } from '../../../../components/unsaved-changes-blocker'
import {
  createParcel,
  type CreateParcelRequestDto,
} from '../../../../lib/api/api.gen'
import { ApiError } from '../../../../lib/api/custom-fetch'
import i18n from '../../../../lib/i18n'
import { isValidMoneyAmount, normalizeMoneyAmount } from '../../../../lib/money'

const WEIGHT_KG_PATTERN = /^(?:0|[1-9]\d{0,3})(?:\.\d{1,3})?$/

export const Route = createFileRoute('/_authenticated/admin/parcels/add')({
  staticData: {
    title: i18n.t('parcels:addParcel'),
    fallbackTo: '/admin/parcels',
  },
  component: AddAdminParcelPage,
})

const addAdminParcelSchema = z.object({
  trackingNumber: z
    .string()
    .trim()
    .min(1, i18n.t('validation:trackingNumber.required')),
  description: z.string().trim(),
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

type AddAdminParcelFormValues = z.infer<typeof addAdminParcelSchema>

function AddAdminParcelPage() {
  const navigate = useNavigate()

  const form = useForm<AddAdminParcelFormValues>({
    resolver: zodResolver(addAdminParcelSchema),
    defaultValues: {
      trackingNumber: '',
      description: '',
      weightKg: '',
      deliveryFee: '',
    },
  })

  const addParcelMutation = useMutation({
    mutationFn: (dto: CreateParcelRequestDto) => createParcel(dto),
  })

  const onSubmit = async ({
    trackingNumber,
    description,
    weightKg,
    deliveryFee,
  }: AddAdminParcelFormValues) => {
    try {
      const { id } = await addParcelMutation.mutateAsync({
        trackingNumber,
        description: description || undefined,
        weightKg:
          weightKg === '' ? undefined : new BigNumber(weightKg).toFixed(),
        deliveryFee:
          deliveryFee === '' ? undefined : normalizeMoneyAmount(deliveryFee),
      })

      await navigate({
        to: '/admin/parcels/$parcelId',
        params: { parcelId: id },
        ignoreBlocker: true,
        replace: true,
      })
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
