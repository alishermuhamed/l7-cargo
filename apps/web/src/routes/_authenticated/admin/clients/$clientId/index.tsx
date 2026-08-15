import { Box, Card, Container, DataList, Flex, Heading } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { SearchField } from '../../../../../components/search-field/search-field'
import { Select } from '../../../../../components/select/select'
import { ParcelCardsList } from '../../../../../features/parcels/components/parcel-cards-list'
import { ParcelsTable } from '../../../../../features/parcels/components/parcels-table'
import { PARCEL_STATUS_LABELS } from '../../../../../features/parcels/lib/parcel-status-labels'
import { ParcelStatus } from '../../../../../lib/api/api.gen'
import { getClientQueryOptions } from '../../../../../lib/api/queries'
import i18n from '../../../../../lib/i18n'
import { formatPhoneNumber } from '../../../../../lib/phone-number'

export const Route = createFileRoute(
  '/_authenticated/admin/clients/$clientId/'
)({
  staticData: {
    title: i18n.t('clients:clientDetails'),
    fallbackTo: '/admin/clients',
  },
  loader: async ({ params: { clientId }, context: { queryClient } }) => {
    const initialClient = await queryClient.ensureQueryData(
      getClientQueryOptions(clientId)
    )

    return { initialClient }
  },
  component: AdminClientDetailsPage,
})

function AdminClientDetailsPage() {
  const { initialClient } = Route.useLoaderData()

  const [parcelsSearch, setParcelsSearch] = useState('')
  const [parcelsStatus, setParcelsStatus] = useState<ParcelStatus | 'all'>(
    'all'
  )

  const { data: client } = useQuery({
    ...getClientQueryOptions(initialClient.id),
    initialData: initialClient,
  })

  return (
    <Container p="4">
      <Flex direction="column" gap="4">
        <Card size="3">
          <DataList.Root>
            <DataList.Item>
              <DataList.Label>{i18n.t('clients:code')}</DataList.Label>
              <DataList.Value>{client.code}</DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label>{i18n.t('profile:name')}</DataList.Label>
              <DataList.Value>{client.user?.name ?? '-'}</DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label>{i18n.t('auth:phoneNumber')}</DataList.Label>
              <DataList.Value>
                {formatPhoneNumber(
                  client.user?.phoneNumber ?? client.legacyPhoneRaw ?? ''
                ) ?? '-'}
              </DataList.Value>
            </DataList.Item>
          </DataList.Root>
        </Card>

        <Flex direction="column" gap="3">
          <Heading size="4">{i18n.t('parcels:parcels')}</Heading>

          <Flex align="center" gap="3">
            <Box maxWidth="250px">
              <SearchField value={parcelsSearch} onChange={setParcelsSearch} />
            </Box>

            <Box
              width="150px"
              flexGrow={{ initial: '1', xs: '0' }}
              flexShrink="0"
            >
              <Select
                value={parcelsStatus}
                onValueChange={setParcelsStatus}
                items={[
                  { label: i18n.t('parcels:all'), value: 'all' },
                  ...Object.values(ParcelStatus).map((status) => ({
                    label: PARCEL_STATUS_LABELS[status],
                    value: status,
                  })),
                ]}
              />
            </Box>
          </Flex>

          <Box display={{ initial: 'block', xs: 'none' }}>
            <ParcelCardsList
              search={parcelsSearch}
              status={parcelsStatus === 'all' ? undefined : parcelsStatus}
              clientId={client.id}
              isAdminPage
            />
          </Box>

          <Box display={{ initial: 'none', xs: 'block' }}>
            <ParcelsTable
              search={parcelsSearch}
              status={parcelsStatus === 'all' ? undefined : parcelsStatus}
              clientId={client.id}
              isAdminPage
            />
          </Box>
        </Flex>
      </Flex>
    </Container>
  )
}
