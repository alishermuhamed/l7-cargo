import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { Container, DataList, Flex, Text } from '@radix-ui/themes'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  Link as RouterLink,
  useNavigate,
} from '@tanstack/react-router'
import BigNumber from 'bignumber.js'
import { useState } from 'react'

import { AlertDialog } from '../../../../../components/alert-dialog'
import { Button } from '../../../../../components/button'
import { CopyButton } from '../../../../../components/copy-button'
import { ParcelStatusHistory } from '../../../../../features/parcels/components/parcel-status-history/parcel-status-history'
import { deleteParcel } from '../../../../../lib/api/api.gen'
import {
  getParcelQueryOptions,
  getParcelStatusHistoryQueryOptions,
  getUserQueryOptions,
} from '../../../../../lib/api/queries'
import i18n from '../../../../../lib/i18n'
import { formatMoneyAmount } from '../../../../../lib/money'

export const Route = createFileRoute(
  '/_authenticated/admin/parcels/$parcelId/'
)({
  staticData: {
    title: i18n.t('parcels:parcelDetails'),
    fallbackTo: '/admin/parcels',
  },
  loader: async ({ params: { parcelId }, context: { queryClient } }) => {
    const [initialParcel, initialStatusHistory] = await Promise.all([
      queryClient.ensureQueryData(getParcelQueryOptions(parcelId)),
      queryClient.ensureQueryData(getParcelStatusHistoryQueryOptions(parcelId)),
    ])

    return { initialParcel, initialStatusHistory }
  },
  component: AdminParcelPage,
})

function AdminParcelPage() {
  const navigate = useNavigate()
  const { initialParcel, initialStatusHistory } = Route.useLoaderData()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: parcel } = useQuery({
    ...getParcelQueryOptions(initialParcel.id),
    initialData: initialParcel,
  })
  const { data: owner } = useQuery({
    ...getUserQueryOptions(parcel.userId ?? ''),
    enabled: parcel.userId !== null,
  })
  const { data: statusHistory } = useQuery({
    ...getParcelStatusHistoryQueryOptions(initialParcel.id),
    initialData: initialStatusHistory,
  })

  const deleteParcelMutation = useMutation({
    mutationFn: () => deleteParcel(initialParcel.id),
    onSuccess: async () => {
      await navigate({
        to: '/admin/parcels',
        replace: true,
        ignoreBlocker: true,
      })
    },
  })

  return (
    <Container p="4">
      <Flex direction="column" gap="4">
        <DataList.Root>
          <DataList.Item>
            <DataList.Label>{i18n.t('parcels:trackingNumber')}</DataList.Label>
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
            <DataList.Label>{i18n.t('parcels:owner')}</DataList.Label>
            <DataList.Value>
              {owner ? (
                <Text asChild weight="medium">
                  <RouterLink
                    to="/admin/clients/$clientId"
                    params={{ clientId: owner.id }}
                  >
                    {owner.name}
                  </RouterLink>
                </Text>
              ) : (
                '-'
              )}
            </DataList.Value>
          </DataList.Item>

          <DataList.Item>
            <DataList.Label>{i18n.t('parcels:weight')}</DataList.Label>
            <DataList.Value>
              {parcel.weightKg !== null
                ? i18n.t('parcels:weightValue', {
                    weight: new BigNumber(parcel.weightKg).toFixed(),
                  })
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
        </DataList.Root>

        <ParcelStatusHistory history={statusHistory} />

        <Flex
          direction={{ initial: 'column', xs: 'row' }}
          justify="end"
          gap="3"
          align={{ initial: 'stretch', xs: 'center' }}
        >
          <Button asChild variant="soft" color="gray">
            <RouterLink
              to="/admin/parcels/$parcelId/edit"
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
