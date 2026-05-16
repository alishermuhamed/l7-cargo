import {
  Box,
  Card,
  Container,
  DataList,
  Flex,
  Heading,
  Table,
} from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { ParcelStatusBadge } from '../../../../../features/parcels/components/parcel-status-badge'
import { formatWeightKg } from '../../../../../features/parcels/lib/format-weight'
import {
  PARSE_ERROR_LABELS,
  PARSE_WARNING_LABELS,
} from '../../../../../features/parcels-imports/lib/parcels-import-labels'
import { getParcelsImportQueryOptions } from '../../../../../lib/api/queries'
import { formatDateTime } from '../../../../../lib/date-time'
import i18n from '../../../../../lib/i18n'
import { formatMoneyAmount } from '../../../../../lib/money'

export const Route = createFileRoute(
  '/_authenticated/admin/parcels-imports/$parcelsImportId/'
)({
  staticData: {
    title: i18n.t('parcels:parcelsImportDetails'),
    fallbackTo: '/admin/parcels',
  },
  loader: async ({ params: { parcelsImportId }, context: { queryClient } }) => {
    const initialParcelsImport = await queryClient.ensureQueryData(
      getParcelsImportQueryOptions(parcelsImportId)
    )

    return { initialParcelsImport }
  },
  component: AdminParcelsImportDetailsPage,
})

function AdminParcelsImportDetailsPage() {
  const { initialParcelsImport } = Route.useLoaderData()

  const { data: parcelsImport } = useQuery({
    ...getParcelsImportQueryOptions(initialParcelsImport.id),
    initialData: initialParcelsImport,
  })

  const parsedData = parcelsImport.parsedData

  return (
    <Container p="4">
      <Flex direction="column" gap="4">
        <Card size="3">
          <DataList.Root>
            <DataList.Item>
              <DataList.Label>{i18n.t('parcels:parcelStatus')}</DataList.Label>
              <DataList.Value>
                <ParcelStatusBadge status={parcelsImport.parcelStatus} />
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label>{i18n.t('parcels:committed')}</DataList.Label>
              <DataList.Value>
                {parcelsImport.isCommitted
                  ? i18n.t('parcels:committed')
                  : i18n.t('parcels:notCommitted')}
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label>{i18n.t('parcels:committedAt')}</DataList.Label>
              <DataList.Value>
                {parcelsImport.committedAt
                  ? formatDateTime(parcelsImport.committedAt)
                  : '-'}
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label>{i18n.t('parcels:rowsCount')}</DataList.Label>
              <DataList.Value>{parsedData.rows.length}</DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label>{i18n.t('parcels:errorsCount')}</DataList.Label>
              <DataList.Value>{parsedData.errors.length}</DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label>{i18n.t('parcels:warningsCount')}</DataList.Label>
              <DataList.Value>{parsedData.warnings.length}</DataList.Value>
            </DataList.Item>
          </DataList.Root>
        </Card>

        {parsedData.errors.length > 0 && (
          <Flex direction="column" gap="3">
            <Heading size="4">{i18n.t('parcels:importErrors')}</Heading>

            <Box overflowX="auto">
              <Table.Root size={{ initial: '3', xs: '2' }}>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>
                      {i18n.t('parcels:rowNumber')}
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      {i18n.t('parcels:issue')}
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {parsedData.errors.map((error) => (
                    <Table.Row key={`${error.rowNumber}-${error.code}`}>
                      <Table.RowHeaderCell>
                        {error.rowNumber}
                      </Table.RowHeaderCell>
                      <Table.Cell>{PARSE_ERROR_LABELS[error.code]}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Flex>
        )}

        {parsedData.warnings.length > 0 && (
          <Flex direction="column" gap="3">
            <Heading size="4">{i18n.t('parcels:importWarnings')}</Heading>

            <Box overflowX="auto">
              <Table.Root size={{ initial: '3', xs: '2' }}>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>
                      {i18n.t('parcels:rowNumber')}
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      {i18n.t('parcels:issue')}
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {parsedData.warnings.map((warning) => (
                    <Table.Row key={`${warning.rowNumber}-${warning.code}`}>
                      <Table.RowHeaderCell>
                        {warning.rowNumber}
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        {PARSE_WARNING_LABELS[warning.code]}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Flex>
        )}

        <Flex direction="column" gap="3">
          <Heading size="4">{i18n.t('parcels:rows')}</Heading>

          <Box overflowX="auto">
            <Table.Root size={{ initial: '3', xs: '2' }}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>
                    {i18n.t('parcels:rowNumber')}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    {i18n.t('parcels:clientId')}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    {i18n.t('parcels:trackingNumber')}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    {i18n.t('parcels:weight')}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    {i18n.t('parcels:deliveryFee')}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    {i18n.t('parcels:notes')}
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {parsedData.rows.map((row) => (
                  <Table.Row key={row.rowNumber}>
                    <Table.RowHeaderCell>{row.rowNumber}</Table.RowHeaderCell>

                    <Table.Cell>{row.clientId}</Table.Cell>

                    <Table.Cell>{row.trackingNumber}</Table.Cell>

                    <Table.Cell>
                      {row.weightKg ? formatWeightKg(row.weightKg) : '-'}
                    </Table.Cell>

                    <Table.Cell>
                      {row.deliveryFee
                        ? formatMoneyAmount(row.deliveryFee, 'KZT')
                        : '-'}
                    </Table.Cell>

                    <Table.Cell>{row.notes ?? '-'}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Flex>
      </Flex>
    </Container>
  )
}
