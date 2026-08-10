import { zodResolver } from '@hookform/resolvers/zod'
import { Card, Checkbox, Container, Flex } from '@radix-ui/themes'
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
import { Select } from '../../../../components/select/select'
import { TextField } from '../../../../components/text-field'
import { UnsavedChangesBlocker } from '../../../../components/unsaved-changes-blocker'
import { PARCEL_STATUS_LABELS } from '../../../../features/parcels/lib/parcel-status-labels'
import {
  createParcelsImport,
  type CreateParcelsImportRequestDto,
  ParcelStatus,
} from '../../../../lib/api/api.gen'
import i18n from '../../../../lib/i18n'

export const Route = createFileRoute(
  '/_authenticated/admin/parcels-imports/add'
)({
  staticData: {
    title: i18n.t('parcels:addParcelsImport'),
    fallbackTo: '/admin/parcels-imports',
  },
  component: AdminAddParcelsImportPage,
})

const addParcelsImportSchema = z.object({
  file: z
    .file(i18n.t('validation:file.required'))
    .mime(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      i18n.t('validation:file.onlyXlsx')
    ),
  parcelStatus: z.enum(Object.values(ParcelStatus)),
  achievedAt: z.iso.date(),
  withHeader: z.boolean(),
})

type AddParcelsImportFormValues = z.infer<typeof addParcelsImportSchema>

function AdminAddParcelsImportPage() {
  const navigate = useNavigate()

  const form = useForm<AddParcelsImportFormValues>({
    resolver: zodResolver(addParcelsImportSchema),
    defaultValues: {
      file: undefined,
      parcelStatus: ParcelStatus.left_china,
      achievedAt: '',
      withHeader: true,
    },
  })

  const createParcelsImportMutation = useMutation({
    mutationFn: (dto: CreateParcelsImportRequestDto) =>
      createParcelsImport(dto),
  })

  const onSubmit = async ({
    file,
    parcelStatus,
    achievedAt,
    withHeader,
  }: AddParcelsImportFormValues) => {
    try {
      const { id } = await createParcelsImportMutation.mutateAsync({
        file,
        parcelStatus,
        achievedAt,
        withHeader: withHeader ? 'true' : 'false',
      })

      await navigate({
        to: '/admin/parcels-imports/$parcelsImportId',
        params: { parcelsImportId: id },
        ignoreBlocker: true,
        replace: true,
      })
    } catch {
      toast.error(i18n.t('parcels:unableToAddParcelsImport'))
    }
  }

  return (
    <Container p="4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            <Card size="3">
              <Flex direction="column" gap="4">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormFieldItem>
                      <FormFieldLabel>
                        {i18n.t('parcels:importFile')}
                      </FormFieldLabel>

                      <FormFieldControl>
                        <input
                          ref={field.ref}
                          name={field.name}
                          type="file"
                          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                          onChange={(event) =>
                            field.onChange(event.target.files?.[0])
                          }
                          onBlur={field.onBlur}
                        />
                      </FormFieldControl>

                      <FormFieldError />
                    </FormFieldItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parcelStatus"
                  render={({ field }) => (
                    <FormFieldItem>
                      <FormFieldLabel>
                        {i18n.t('parcels:parcelStatus')}
                      </FormFieldLabel>

                      <FormFieldControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          items={Object.values(ParcelStatus).map((ps) => ({
                            label: PARCEL_STATUS_LABELS[ps],
                            value: ps,
                          }))}
                        />
                      </FormFieldControl>

                      <FormFieldError />
                    </FormFieldItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="achievedAt"
                  render={({ field }) => (
                    <FormFieldItem>
                      <FormFieldLabel>
                        {i18n.t('parcels:achievedAt')}
                      </FormFieldLabel>

                      <FormFieldControl>
                        <TextField.Root type="date" {...field} />
                      </FormFieldControl>

                      <FormFieldError />
                    </FormFieldItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="withHeader"
                  render={({ field }) => (
                    <FormFieldItem direction="row" align="center">
                      <FormFieldControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />
                      </FormFieldControl>

                      <FormFieldLabel>
                        {i18n.t('parcels:withHeader')}
                      </FormFieldLabel>

                      <FormFieldError />
                    </FormFieldItem>
                  )}
                />
              </Flex>
            </Card>

            <Flex
              direction={{ initial: 'column-reverse', xs: 'row' }}
              justify="end"
              gap="3"
            >
              <Button
                type="button"
                variant="soft"
                color="gray"
                onClick={() => navigate({ to: '/admin/parcels-imports' })}
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
