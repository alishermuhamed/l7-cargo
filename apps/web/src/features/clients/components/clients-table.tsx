import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons'
import { Flex, Skeleton, Table, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { Button } from '../../../components/button'
import { IconButton } from '../../../components/icon-button'
import { getClientsQueryOptions } from '../../../lib/api/queries'
import { formatClientCode } from '../../../lib/client-code'
import i18n from '../../../lib/i18n'
import { formatPhoneNumber } from '../../../lib/phone-number'

const CLIENTS_PAGE_SIZE = 20

interface ClientsTableProps {
  search: string
  page: number
  onPageChange: (page: number) => void
}

export function ClientsTable({
  search,
  page,
  onPageChange,
}: ClientsTableProps) {
  const params = {
    limit: CLIENTS_PAGE_SIZE,
    offset: page * CLIENTS_PAGE_SIZE,
    search: search.length === 0 ? undefined : search,
  }

  const { data: clients = [], isPending: isPageLoading } = useQuery(
    getClientsQueryOptions(params)
  )

  const hasNextPage = clients.length === CLIENTS_PAGE_SIZE

  return (
    <Flex direction="column" gap="3">
      <Table.Root size={{ initial: '3', xs: '2' }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              {i18n.t('clients:code')}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {i18n.t('profile:name')}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {i18n.t('auth:phoneNumber')}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {clients.length > 0 &&
            clients.map((client) => (
              <Table.Row key={client.id}>
                <Table.Cell>{formatClientCode(client.code)}</Table.Cell>

                <Table.RowHeaderCell>
                  {client.user?.name ?? '-'}
                </Table.RowHeaderCell>

                <Table.Cell>
                  {formatPhoneNumber(
                    client.user?.phoneNumber ??
                      client.legacyPhoneNormalized ??
                      client.legacyPhoneRaw ??
                      ''
                  ) ?? '-'}
                </Table.Cell>

                <Table.Cell align="right">
                  <Button asChild variant="ghost">
                    <Link
                      to="/admin/clients/$clientId"
                      params={{ clientId: client.id }}
                    >
                      {i18n.t('clients:details')} <ArrowRightIcon />
                    </Link>
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}

          {isPageLoading && (
            <Table.Row>
              <Table.Cell>
                <Skeleton />
              </Table.Cell>

              <Table.RowHeaderCell>
                <Skeleton />
              </Table.RowHeaderCell>

              <Table.Cell>
                <Skeleton />
              </Table.Cell>

              <Table.Cell>
                <Skeleton width="90px" />
              </Table.Cell>
            </Table.Row>
          )}

          {!isPageLoading && clients.length === 0 && (
            <Table.Row>
              <Table.Cell align="center" colSpan={4}>
                {i18n.t('clients:noClientsFound')}
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
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0 || isPageLoading}
        >
          <ArrowLeftIcon />
        </IconButton>

        <IconButton
          type="button"
          tooltip={i18n.t('common:next')}
          variant="soft"
          color="gray"
          onClick={() => onPageChange(page + 1)}
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
