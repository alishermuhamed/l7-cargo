import { zodResolver } from '@hookform/resolvers/zod'
import { Container, Flex } from '@radix-ui/themes'
import { useMutation } from '@tanstack/react-query'
import {
  createFileRoute,
  Link as RouterLink,
  useNavigate,
} from '@tanstack/react-router'
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
import { TextField } from '../../../../../components/text-field'
import { UnsavedChangesBlocker } from '../../../../../components/unsaved-changes-blocker'
import {
  updateParcel,
  type UpdateParcelRequestDto,
} from '../../../../../lib/api/api.gen'
import { getParcelQueryOptions } from '../../../../../lib/api/queries'
import i18n from '../../../../../lib/i18n'

export const Route = createFileRoute(
  '/_authenticated/_menu/parcels/$parcelId/edit'
)({
  staticData: {
    title: i18n.t('parcels:editParcel'),
    fallbackTo: '/parcels',
  },
  loader: async ({ context: { queryClient }, params: { parcelId } }) => {
    const initialParcel = await queryClient.ensureQueryData(
      getParcelQueryOptions(parcelId)
    )

    return { initialParcel }
  },
  component: EditParcelPage,
})

const editParcelSchema = z.object({
  source: z.string(),
  description: z.string().trim(),
})

type EditParcelFormValues = z.infer<typeof editParcelSchema>

function EditParcelPage() {
  const navigate = useNavigate()

  const { initialParcel } = Route.useLoaderData()

  const form = useForm<EditParcelFormValues>({
    resolver: zodResolver(editParcelSchema),
    defaultValues: {
      source: initialParcel.source ?? '',
      description: initialParcel.description ?? '',
    },
  })

  const editParcelMutation = useMutation({
    mutationFn: (dto: UpdateParcelRequestDto) =>
      updateParcel(initialParcel.id, dto),
  })

  const onSubmit = async ({ description }: EditParcelFormValues) => {
    try {
      await editParcelMutation.mutateAsync({ description: description || null })
      await navigate({
        to: '/parcels/$parcelId',
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
              <Button asChild variant="soft" color="gray">
                <RouterLink
                  to="/parcels/$parcelId"
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
