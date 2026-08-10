import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import {
  Card,
  Container,
  DataList,
  Flex,
  Heading,
  Text,
} from '@radix-ui/themes'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { useState } from 'react'

import { AlertDialog } from '../../../../../components/alert-dialog'
import { Button } from '../../../../../components/button'
import { CopyButton } from '../../../../../components/copy-button'
import {
  ParcelStatusHistory,
  ParcelStatusHistoryItem,
} from '../../../../../features/parcels/components/parcel-status-history/parcel-status-history'
import { formatWeightKg } from '../../../../../features/parcels/lib/format-weight'
import { PARCEL_STATUS_LABELS } from '../../../../../features/parcels/lib/parcel-status-labels'
import { deleteParcel, ParcelStatus } from '../../../../../lib/api/api.gen'
import {
  getParcelQueryOptions,
  getParcelStatusHistoryQueryOptions,
} from '../../../../../lib/api/queries'
import { formatDate } from '../../../../../lib/date-time'
import i18n from '../../../../../lib/i18n'
import { formatMoneyAmount } from '../../../../../lib/money'

export const Route = createFileRoute(
  '/_authenticated/_client/parcels/$parcelId/'
)({
  staticData: {
    title: i18n.t('parcels:parcelDetails'),
    fallbackTo: '/parcels',
  },
  loader: async ({ params: { parcelId }, context: { queryClient } }) => {
    const [initialParcel, initialStatusHistory] = await Promise.all([
      queryClient.ensureQueryData(getParcelQueryOptions(parcelId)),
      queryClient.ensureQueryData(getParcelStatusHistoryQueryOptions(parcelId)),
    ])

    return { initialParcel, initialStatusHistory }
  },
  component: ParcelPage,
})

function ParcelPage() {
  const { initialParcel, initialStatusHistory } = Route.useLoaderData()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: parcel } = useQuery({
    ...getParcelQueryOptions(initialParcel.id),
    initialData: initialParcel,
  })
  const { data: statusHistory } = useQuery({
    ...getParcelStatusHistoryQueryOptions(initialParcel.id),
    initialData: initialStatusHistory,
  })

  const deleteParcelMutation = useMutation({
    mutationFn: () => deleteParcel(initialParcel.id),
  })

  return (
    <Container p="4">
      <Flex direction="column" gap="4">
        <Card size="3">
          <DataList.Root>
            <DataList.Item>
              <DataList.Label>
                {i18n.t('parcels:trackingNumber')}
              </DataList.Label>
              <DataList.Value>
                <Flex align="center" gap="2">
                  <Text>{parcel.trackingNumber}</Text>
                  <CopyButton data={parcel.trackingNumber} />
                </Flex>
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label>{i18n.t('parcels:description')}</DataList.Label>
              <DataList.Value>{parcel.description ?? '-'}</DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label>{i18n.t('parcels:weight')}</DataList.Label>
              <DataList.Value>
                {parcel.weightKg !== null
                  ? formatWeightKg(parcel.weightKg)
                  : '-'}
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label>{i18n.t('parcels:deliveryFee')}</DataList.Label>
              <DataList.Value>
                {parcel.deliveryFee !== null
                  ? formatMoneyAmount(parcel.deliveryFee, 'KZT')
                  : '-'}
              </DataList.Value>
            </DataList.Item>

            {parcel.notes && (
              <DataList.Item>
                <DataList.Label>{i18n.t('parcels:notes')}</DataList.Label>
                <DataList.Value>{parcel.notes}</DataList.Value>
              </DataList.Item>
            )}
          </DataList.Root>
        </Card>

        <Heading size="4">{i18n.t('parcels:statusHistory')}</Heading>

        <ParcelStatusHistory>
          {Object.values(ParcelStatus).map((status) => {
            const existingEntry = statusHistory.find(
              (item) => item.status === status
            )

            const isAchieved = !!existingEntry?.achievedAt

            return (
              <ParcelStatusHistoryItem key={status} isAchieved={isAchieved}>
                <Flex mt="-1" mb="4" direction="column">
                  <Text
                    as="p"
                    weight={isAchieved ? 'medium' : 'regular'}
                    color={isAchieved ? undefined : 'gray'}
                  >
                    {PARCEL_STATUS_LABELS[status]}
                  </Text>

                  <Text as="p" color="gray" size="2">
                    {isAchieved
                      ? formatDate(existingEntry.achievedAt)
                      : i18n.t('parcels:pendingStatus')}
                  </Text>
                </Flex>
              </ParcelStatusHistoryItem>
            )
          })}
        </ParcelStatusHistory>

        <Flex
          direction={{ initial: 'column', xs: 'row' }}
          justify="end"
          gap="3"
          align={{ initial: 'stretch', xs: 'center' }}
        >
          <Button asChild variant="soft" color="gray">
            <RouterLink
              to="/parcels/$parcelId/edit"
              params={{ parcelId: initialParcel.id }}
            >
              <Pencil1Icon />
              {i18n.t('common:edit')}
            </RouterLink>
          </Button>

          <Button
            type="button"
            variant="soft"
            color="red"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <TrashIcon />
            {i18n.t('parcels:deleteParcelAction')}
          </Button>
        </Flex>
      </Flex>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={i18n.t('parcels:deleteParcelTitle')}
        description={i18n.t('parcels:deleteParcelDescription')}
        actionLabel={i18n.t('parcels:deleteParcelAction')}
        actionColor="red"
        onAction={() => deleteParcelMutation.mutate()}
      />
    </Container>
  )
}
