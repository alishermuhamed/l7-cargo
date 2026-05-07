import { Container, Flex } from '@radix-ui/themes'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { AlertDialog } from '../../../../../components/alert-dialog'
import { deleteParcel } from '../../../../../lib/api/api.gen'
import { getParcelQueryOptions } from '../../../../../lib/api/queries'

export const Route = createFileRoute(
  '/_authenticated/_menu/parcels/$parcelId/'
)({
  staticData: {
    title: 'Parcel Details',
    fallbackTo: '/parcels',
  },
  loader: async ({ params: { parcelId }, context: { queryClient } }) => {
    const initialParcel = await queryClient.ensureQueryData(
      getParcelQueryOptions(parcelId)
    )

    return { initialParcel }
  },
  component: ParcelPage,
})

function ParcelPage() {
  const { initialParcel } = Route.useLoaderData()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: parcel } = useQuery({
    ...getParcelQueryOptions(initialParcel.id),
    initialData: initialParcel,
  })

  const deleteParcelMutation = useMutation({
    mutationFn: () => deleteParcel(initialParcel.id),
  })

  return (
    <Container p="4">
      <Flex direction="column" gap="6">
        {JSON.stringify(parcel)}
      </Flex>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Parcel"
        description="Delete Parcel Description"
        actionLabel="Delete"
        actionColor="red"
        onAction={() => deleteParcelMutation.mutate()}
      />
    </Container>
  )
}
