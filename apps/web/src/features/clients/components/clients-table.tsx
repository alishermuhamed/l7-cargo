import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons'
import { Flex, Skeleton, Table, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useReducer } from 'react'

import { IconButton } from '../../../components/icon-button'
import { useDebounce } from '../../../hooks/use-debounce'
import { UserRole } from '../../../lib/api/api.gen'
import { getUsersQueryOptions } from '../../../lib/api/queries'
import i18n from '../../../lib/i18n'
import { formatPhoneNumber } from '../../../lib/phone-number'

const CLIENTS_PAGE_SIZE = 20

interface ClientsTableProps {
  search: string
}

export function ClientsTable({ search }: ClientsTableProps) {
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
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    dispatchPage('reset')
  }, [search])

  const params = {
    limit: CLIENTS_PAGE_SIZE,
    offset: page * CLIENTS_PAGE_SIZE,
    role: UserRole.client,
    search: debouncedSearch.length === 0 ? undefined : debouncedSearch,
  }

  const { data: clients = [], isPending: isPageLoading } = useQuery(
    getUsersQueryOptions(params)
  )

  const hasNextPage = clients.length === CLIENTS_PAGE_SIZE

  return (
    <Flex direction="column" gap="3">
      <Table.Root size={{ initial: '3', xs: '2' }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              {i18n.t('profile:name')}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {i18n.t('auth:phoneNumber')}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {clients.length > 0 &&
            clients.map((client) => (
              <Table.Row key={client.id}>
                <Table.RowHeaderCell>{client.name}</Table.RowHeaderCell>

                <Table.Cell>
                  {formatPhoneNumber(client.phoneNumber ?? '')}
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
            </Table.Row>
          )}

          {!isPageLoading && clients.length === 0 && (
            <Table.Row>
              <Table.Cell align="center" colSpan={2}>
                {i18n.t('clients:noClientsFound')}
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
          color="gray"
          onClick={() => dispatchPage('prev')}
          disabled={page === 0 || isPageLoading}
        >
          <ArrowLeftIcon />
        </IconButton>

        <IconButton
          type="button"
          tooltip="Next"
          variant="soft"
          color="gray"
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
