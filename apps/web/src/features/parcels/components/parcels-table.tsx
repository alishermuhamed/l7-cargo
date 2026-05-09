import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons'
import { Flex, Skeleton, Table, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect, useReducer } from 'react'

import { Button } from '../../../components/button'
import { IconButton } from '../../../components/icon-button'
import { useDebounce } from '../../../hooks/use-debounce'
import { type GetParcelsParams, ParcelStatus } from '../../../lib/api/api.gen'
import { getParcelsQueryOptions } from '../../../lib/api/queries'
import i18n from '../../../lib/i18n'
import { ParcelStatusBadge } from './parcel-status-badge'

const PARCELS_PAGE_SIZE = 20

interface ParcelsTableProps {
  search: string
  status?: ParcelStatus
}

export function ParcelsTable({ search, status }: ParcelsTableProps) {
  const [page, dispatchPage] = useReducer(
    (page: number, action: 'next' | 'prev' | 'reset') => {
      switch (action) {
        case 'next':
          return page + 1

        case 'prev':
          return Math.max(0, page - 1)

        case 'reset':
          return 0
      }
    },
    0
  )
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    dispatchPage('reset')
  }, [search, status])

  const params: GetParcelsParams = {
    limit: PARCELS_PAGE_SIZE,
    offset: page * PARCELS_PAGE_SIZE,
    search: debouncedSearch.length === 0 ? undefined : debouncedSearch,
    status,
  }

  const { data: parcels = [], isPending: isPageLoading } = useQuery(
    getParcelsQueryOptions(params)
  )

  const hasNextPage = parcels.length === PARCELS_PAGE_SIZE

  return (
    <Flex direction="column" gap="3">
      <Table.Root size={{ initial: '3', xs: '2' }}>
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
            parcels.map((parcel) => (
              <Table.Row key={parcel.id}>
                <Table.RowHeaderCell>
                  {parcel.trackingNumber}
                </Table.RowHeaderCell>

                <Table.Cell>
                  {parcel.description ?? i18n.t('parcels:noDescription')}
                </Table.Cell>

                <Table.Cell>
                  <ParcelStatusBadge status={parcel.status} />
                </Table.Cell>

                <Table.Cell align="right">
                  <Button asChild variant="ghost">
                    <Link
                      to="/parcels/$parcelId"
                      params={{ parcelId: parcel.id }}
                    >
                      {i18n.t('parcels:details')} <ArrowRightIcon />
                    </Link>
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}

          {isPageLoading && (
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

          {!isPageLoading && parcels.length === 0 && (
            <Table.Row>
              <Table.Cell align="center" colSpan={4}>
                {i18n.t('parcels:noParcelsFound')}
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>

      <Flex align="center" gap="3">
        <IconButton
          type="button"
          tooltip="Previous"
          variant="soft"
          onClick={() => dispatchPage('prev')}
          disabled={page === 0 || isPageLoading}
        >
          <ArrowLeftIcon />
        </IconButton>

        <IconButton
          type="button"
          tooltip="Next"
          variant="soft"
          onClick={() => dispatchPage('next')}
          disabled={!hasNextPage || isPageLoading}
        >
          <ArrowRightIcon />
        </IconButton>

        <Text size="2" color="gray">
          Page {page + 1}
        </Text>
      </Flex>
    </Flex>
  )
}
