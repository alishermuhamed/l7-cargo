import './index.css'

import { ArrowRightIcon, PlusIcon } from '@radix-ui/react-icons'
import {
  Box,
  Card,
  Container,
  Flex,
  Skeleton,
  Table,
  Text,
} from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '../../../../components/button'
import { SearchField } from '../../../../components/search-field/search-field'
import { Select } from '../../../../components/select'
import { ParcelStatusBadge } from '../../../../features/parcels/components/parcel-status-badge'
import { ReadyForPickupBalance } from '../../../../features/parcels/components/ready-for-pickup-balance'
import { PARCEL_STATUS_LABELS } from '../../../../features/parcels/lib/parcel-status-labels'
import { useDebounce } from '../../../../hooks/use-debounce'
import {
  type GetParcelsParams,
  ParcelStatus,
} from '../../../../lib/api/api.gen'
import { getParcelsQueryOptions } from '../../../../lib/api/queries'
import i18n from '../../../../lib/i18n'

export const Route = createFileRoute('/_authenticated/_client/parcels/')({
  staticData: {
    title: i18n.t('parcels:parcels'),
  },
  component: ParcelsPage,
})

function ParcelsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ParcelStatus | 'all'>('all')
  const parcelStatuses = Object.values(ParcelStatus) as ParcelStatus[]

  const debouncedSearch = useDebounce(search, 500)

  const params: GetParcelsParams = {
    search: debouncedSearch,
    status: status === 'all' ? undefined : status,
  }

  const { data: parcels = [], isLoading: areParcelsLoading } = useQuery(
    getParcelsQueryOptions(params)
  )

  return (
    <Container p="4">
      <Flex direction="column" gap="4">
        <ReadyForPickupBalance />

        <Flex
          direction={{ initial: 'column-reverse', xs: 'row' }}
          align={{ initial: 'stretch', xs: 'center' }}
          justify="between"
          gap="3"
        >
          <Flex align="center" gap="3">
            <Box maxWidth="250px">
              <SearchField value={search} onChange={setSearch} />
            </Box>

            <Box
              width="150px"
              flexGrow={{ initial: '1', xs: '0' }}
              flexShrink="0"
            >
              <Select.Root
                value={status}
                onValueChange={(s) => setStatus(s as ParcelStatus | 'all')}
              >
                <Select.Trigger className="status-filter" />

                <Select.Content>
                  <Select.Item value="all">{i18n.t('parcels:all')}</Select.Item>

                  {parcelStatuses.map((s) => (
                    <Select.Item key={s} value={s}>
                      {PARCEL_STATUS_LABELS[s]}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>

          <Flex direction={{ initial: 'column', xs: 'row' }} flexShrink="0">
            <Button asChild>
              <Link to="/parcels/add">
                <PlusIcon /> {i18n.t('parcels:addParcel')}
              </Link>
            </Button>
          </Flex>
        </Flex>

        <Flex
          display={{ initial: 'flex', xs: 'none' }}
          direction="column"
          gap="3"
        >
          {parcels.length > 0 &&
            parcels.map((p) => (
              <Card key={p.id} asChild>
                <Link to="/parcels/$parcelId" params={{ parcelId: p.id }}>
                  <Flex p="2" align="center" justify="between">
                    <Box>
                      <Text as="p" weight="bold">
                        {p.trackingNumber}
                      </Text>

                      {p.description && (
                        <Text color="gray" weight="medium" size="2">
                          {p.description}
                        </Text>
                      )}

                      {!p.description && (
                        <Text color="gray" weight="light" size="2">
                          {i18n.t('parcels:noDescription')}
                        </Text>
                      )}
                    </Box>

                    <ParcelStatusBadge status={p.status} />
                  </Flex>
                </Link>
              </Card>
            ))}

          {areParcelsLoading && (
            <Card>
              <Flex p="2" align="center" justify="between">
                <Flex direction="column" gap="3">
                  <Skeleton width="150px" height="16px" />
                  <Skeleton width="60px" />
                </Flex>

                <Skeleton width="60px" />
              </Flex>
            </Card>
          )}

          {!areParcelsLoading && parcels.length === 0 && (
            <Card>
              <Flex p="3" align="center" justify="center">
                {i18n.t('parcels:noParcelsFound')}
              </Flex>
            </Card>
          )}
        </Flex>

        <Box display={{ initial: 'none', xs: 'block' }}>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>
                  {i18n.t('parcels:trackingNumber')}
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  {i18n.t('parcels:description')}
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  {i18n.t('parcels:status')}
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell />
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {parcels.length > 0 &&
                parcels.map((p) => (
                  <Table.Row key={p.id}>
                    <Table.RowHeaderCell>
                      {p.trackingNumber}
                    </Table.RowHeaderCell>

                    <Table.Cell>
                      {p.description ?? i18n.t('parcels:noDescription')}
                    </Table.Cell>

                    <Table.Cell>
                      <ParcelStatusBadge status={p.status} />
                    </Table.Cell>

                    <Table.Cell align="right">
                      <Button asChild variant="ghost">
                        <Link
                          to="/parcels/$parcelId"
                          params={{ parcelId: p.id }}
                        >
                          {i18n.t('parcels:details')} <ArrowRightIcon />
                        </Link>
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}

              {areParcelsLoading && (
                <Table.Row>
                  <Table.RowHeaderCell>
                    <Skeleton />
                  </Table.RowHeaderCell>

                  <Table.Cell>
                    <Skeleton />
                  </Table.Cell>

                  <Table.Cell>
                    <Skeleton />
                  </Table.Cell>

                  <Table.Cell>
                    <Skeleton />
                  </Table.Cell>
                </Table.Row>
              )}

              {!areParcelsLoading && parcels.length === 0 && (
                <Table.Row>
                  <Table.Cell align="center" colSpan={4}>
                    {i18n.t('parcels:noParcelsFound')}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      </Flex>
    </Container>
  )
}
