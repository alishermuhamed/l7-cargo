import { ArrowRightIcon, PlusIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
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

import { SearchField } from '../../../../components/search-field/search-field'
import { Select } from '../../../../components/select'
import { useDebounce } from '../../../../hooks/use-debounce'
import {
  type GetParcelsParams,
  ParcelStatus,
} from '../../../../lib/api/api.gen'
import { getParcelsQueryOptions } from '../../../../lib/api/queries'
import { PARCEL_STATUS_LABELS } from '../../../../features/parcels/lib/parcel-status-labels'

export const Route = createFileRoute('/_authenticated/_menu/parcels/')({
  staticData: {
    title: 'Parcels',
  },
  component: ParcelsPage,
})

function ParcelsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ParcelStatus | 'all'>('all')

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
      <Flex direction="column" gap="6">
        <Flex align="center" gap="3">
          <SearchField value={search} onChange={setSearch} />

          <Select.Root
            value={status}
            onValueChange={(s) => setStatus(s as ParcelStatus | 'all')}
          >
            <Select.Trigger />

            <Select.Content>
              <Select.Item value="all">All</Select.Item>

              {Object.keys(ParcelStatus).map((s: ParcelStatus) => (
                <Select.Item key={s} value={s}>
                  {PARCEL_STATUS_LABELS[s]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Button asChild>
            <Link to="/parcels/add">
              <PlusIcon /> Add Parcel
            </Link>
          </Button>
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
                          No description
                        </Text>
                      )}
                    </Box>

                    <Text>{p.status ?? 'Waiting'}</Text>
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
                No parcels found
              </Flex>
            </Card>
          )}
        </Flex>

        <Box display={{ initial: 'none', xs: 'block' }}>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Tracking Number</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
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

                    <Table.Cell>{p.description}</Table.Cell>

                    <Table.Cell>{p.status}</Table.Cell>

                    <Table.Cell align="right">
                      <Button asChild variant="ghost">
                        <Link
                          to="/parcels/$parcelId"
                          params={{ parcelId: p.id }}
                        >
                          Details <ArrowRightIcon />
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
                    No parcels found
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
