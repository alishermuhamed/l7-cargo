import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Container, Flex, TextField } from '@radix-ui/themes'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'

import {
  Form,
  FormField,
  FormFieldControl,
  FormFieldError,
  FormFieldItem,
  FormFieldLabel,
} from '../../../../components/form'
import { UnsavedChangesBlocker } from '../../../../components/unsaved-changes-blocker'
import { createParcel } from '../../../../lib/api/api.gen'

export const Route = createFileRoute('/_authenticated/_menu/parcels/add')({
  staticData: {
    title: 'Add Parcel',
    fallbackTo: '/parcels',
  },
  component: AddParcelPage,
})

const addParcelSchema = z.object({
  trackingNumber: z.string().trim().min(1, 'Tracking Number is required'),
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
    mutationFn: (values: AddParcelFormValues) => createParcel(values),
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

  const onSubmit = async (values: AddParcelFormValues) => {
    try {
      await addParcelMutation.mutateAsync(values)
      await navigateToParcels({ ignoreBlocker: true, replace: true })
    } catch {
      toast.error('Unable to add parcel')
    }
  }

  return (
    <Container p="4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Flex direction="column" gap="6">
            <FormField
              control={form.control}
              name="trackingNumber"
              render={({ field }) => (
                <FormFieldItem>
                  <FormFieldLabel>Tracking Number *</FormFieldLabel>

                  <FormFieldControl>
                    <TextField.Root
                      placeholder="Enter tracking number"
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
                  <FormFieldLabel>Description</FormFieldLabel>

                  <FormFieldControl>
                    <TextField.Root
                      placeholder="Enter description"
                      autoComplete="off"
                      {...field}
                    />
                  </FormFieldControl>

                  <FormFieldError />
                </FormFieldItem>
              )}
            />

            <Flex align="center" justify="end" gap="3">
              <Button
                type="button"
                variant="soft"
                color="gray"
                onClick={() => navigateToParcels()}
              >
                Cancel
              </Button>

              <Button type="submit" loading={form.formState.isSubmitting}>
                Add
              </Button>
            </Flex>
          </Flex>
        </form>
      </Form>

      <UnsavedChangesBlocker form={form} />
    </Container>
  )
}
