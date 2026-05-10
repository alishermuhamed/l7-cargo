import { Container, DataList, Flex, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import BigNumber from 'bignumber.js'

import { CopyButton } from '../../../../../components/copy-button'
import { ParcelStatusHistory } from '../../../../../features/parcels/components/parcel-status-history/parcel-status-history'
import {
  getParcelQueryOptions,
  getParcelStatusHistoryQueryOptions,
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
  const { initialParcel, initialStatusHistory } = Route.useLoaderData()

  const { data: parcel } = useQuery({
    ...getParcelQueryOptions(initialParcel.id),
    initialData: initialParcel,
  })
  const { data: statusHistory } = useQuery({
    ...getParcelStatusHistoryQueryOptions(initialParcel.id),
    initialData: initialStatusHistory,
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
      </Flex>
    </Container>
  )
}
