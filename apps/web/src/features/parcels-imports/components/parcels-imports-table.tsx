import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons'
import { Flex, Skeleton, Table, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useReducer } from 'react'

import { Button } from '../../../components/button'
import { IconButton } from '../../../components/icon-button'
import { type GetParcelsImportsParams } from '../../../lib/api/api.gen'
import { getParcelsImportsQueryOptions } from '../../../lib/api/queries'
import { formatDateTime } from '../../../lib/date-time'
import i18n from '../../../lib/i18n'
import { ParcelStatusBadge } from '../../parcels/components/parcel-status-badge'

const PARCELS_IMPORTS_PAGE_SIZE = 20

export function ParcelsImportsTable() {
  const [page, dispatchPage] = useReducer(
    (currentPage: number, action: 'next' | 'prev' | 'reset') => {
      switch (action) {
        case 'next':
          return currentPage + 1

        case 'prev':
          return Math.max(0, currentPage - 1)

        case 'reset':
          return 0
      }
    },
    0
  )

  const params: GetParcelsImportsParams = {
    limit: PARCELS_IMPORTS_PAGE_SIZE,
    offset: page * PARCELS_IMPORTS_PAGE_SIZE,
  }

  const { data: parcelsImports = [], isPending: isPageLoading } = useQuery(
    getParcelsImportsQueryOptions(params)
  )

  const hasNextPage = parcelsImports.length === PARCELS_IMPORTS_PAGE_SIZE

  return (
    <Flex direction="column" gap="3">
      <Table.Root size={{ initial: '3', xs: '2' }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              {i18n.t('parcels:createdAt')}
            </Table.ColumnHeaderCell>

            <Table.ColumnHeaderCell>
              {i18n.t('parcels:parcelStatus')}
            </Table.ColumnHeaderCell>

            <Table.ColumnHeaderCell>
              {i18n.t('parcels:committed')}
            </Table.ColumnHeaderCell>

            <Table.ColumnHeaderCell />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {parcelsImports.length > 0 &&
            parcelsImports.map((parcelsImport) => (
              <Table.Row key={parcelsImport.id}>
                <Table.Cell>
                  {formatDateTime(parcelsImport.createdAt)}
                </Table.Cell>

                <Table.Cell>
                  <ParcelStatusBadge status={parcelsImport.parcelStatus} />
                </Table.Cell>

                <Table.Cell>
                  {parcelsImport.isCommitted
                    ? i18n.t('common:yes')
                    : i18n.t('common:no')}
                </Table.Cell>

                <Table.Cell align="right">
                  <Button asChild variant="ghost">
                    <Link
                      to="/admin/parcels-imports/$parcelsImportId"
                      params={{ parcelsImportId: parcelsImport.id }}
                    >
                      {i18n.t('parcels:details')} <ArrowRightIcon />
                    </Link>
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}

          {isPageLoading && (
            <Table.Row>
              <Table.Cell>
                <Skeleton width="120px" />
              </Table.Cell>

              <Table.Cell>
                <Skeleton width="90px" />
              </Table.Cell>

              <Table.Cell>
                <Skeleton width="90px" />
              </Table.Cell>

              <Table.Cell>
                <Skeleton width="40px" />
              </Table.Cell>
            </Table.Row>
          )}

          {!isPageLoading && parcelsImports.length === 0 && (
            <Table.Row>
              <Table.Cell align="center" colSpan={5}>
                {i18n.t('parcels:noParcelsImportsFound')}
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>

      <Flex align="center" gap="3">
        <IconButton
          type="button"
          tooltip={i18n.t('common:previous')}
          variant="soft"
          color="gray"
          onClick={() => dispatchPage('prev')}
          disabled={page === 0 || isPageLoading}
        >
          <ArrowLeftIcon />
        </IconButton>

        <IconButton
          type="button"
          tooltip={i18n.t('common:next')}
          variant="soft"
          color="gray"
          onClick={() => dispatchPage('next')}
          disabled={!hasNextPage || isPageLoading}
        >
          <ArrowRightIcon />
        </IconButton>

        <Text size="2" color="gray">
          {i18n.t('common:page', { page: page + 1 })}
        </Text>
      </Flex>
    </Flex>
  )
}
