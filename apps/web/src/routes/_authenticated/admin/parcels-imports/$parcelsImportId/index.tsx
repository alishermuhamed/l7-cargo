import { MagicWandIcon, TrashIcon } from '@radix-ui/react-icons'
import {
  Box,
  Card,
  Container,
  DataList,
  Flex,
  Heading,
  Table,
} from '@radix-ui/themes'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { AlertDialog } from '../../../../../components/alert-dialog'
import { Button } from '../../../../../components/button'
import { ParcelStatusBadge } from '../../../../../features/parcels/components/parcel-status-badge'
import { formatWeightKg } from '../../../../../features/parcels/lib/format-weight'
import {
  PARSE_ERROR_LABELS,
  PARSE_WARNING_LABELS,
} from '../../../../../features/parcels-imports/lib/parcels-import-labels'
import {
  commitParcelsImport as commitParcelsImportRequest,
  deleteParcelsImport as deleteParcelsImportRequest,
} from '../../../../../lib/api/api.gen'
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
  const navigate = useNavigate()
  const { initialParcelsImport } = Route.useLoaderData()

  const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: parcelsImport } = useQuery({
    ...getParcelsImportQueryOptions(initialParcelsImport.id),
    initialData: initialParcelsImport,
  })

  const commitParcelsImportMutation = useMutation({
    mutationFn: () => commitParcelsImportRequest(initialParcelsImport.id),
  })

  const deleteParcelsImportMutation = useMutation({
    mutationFn: () => deleteParcelsImportRequest(initialParcelsImport.id),
  })

  const commitParcelsImport = async () => {
    try {
      await commitParcelsImportMutation.mutateAsync()
    } catch {
      toast.error(i18n.t('parcels:unableToCommitParcelsImport'))
    }
  }

  const deleteParcelsImport = async () => {
    try {
      await deleteParcelsImportMutation.mutateAsync()

      await navigate({
        to: '/admin/parcels-imports',
        replace: true,
      })
    } catch {
      toast.error(i18n.t('parcels:unableToDeleteParcelsImport'))
    }
  }

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
                  ? i18n.t('common:yes')
                  : i18n.t('common:no')}
              </DataList.Value>
            </DataList.Item>

            {parcelsImport.committedAt && (
              <DataList.Item>
                <DataList.Label>{i18n.t('parcels:committedAt')}</DataList.Label>
                <DataList.Value>
                  {formatDateTime(parcelsImport.committedAt)}
                </DataList.Value>
              </DataList.Item>
            )}
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

      {!parcelsImport.isCommitted && (
        <Flex
          direction={{ initial: 'column-reverse', xs: 'row' }}
          align={{ initial: 'stretch', xs: 'center' }}
          justify="end"
          gap="3"
        >
          <Button
            type="button"
            variant="soft"
            color="red"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <TrashIcon />
            {i18n.t('parcels:deleteParcelsImportAction')}
          </Button>

          <Button
            type="button"
            loading={commitParcelsImportMutation.isPending}
            onClick={() => setIsCommitDialogOpen(true)}
          >
            <MagicWandIcon />
            {i18n.t('parcels:commitParcelsImportAction')}
          </Button>
        </Flex>
      )}

      {!parcelsImport.isCommitted && (
        <>
          <AlertDialog
            open={isCommitDialogOpen}
            onOpenChange={setIsCommitDialogOpen}
            title={i18n.t('parcels:commitParcelsImportTitle')}
            description={i18n.t('parcels:commitParcelsImportDescription')}
            actionLabel={i18n.t('parcels:commitParcelsImportAction')}
            actionColor="green"
            onAction={() => commitParcelsImport()}
          />

          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title={i18n.t('parcels:deleteParcelsImportTitle')}
            description={i18n.t('parcels:deleteParcelsImportDescription')}
            actionLabel={i18n.t('parcels:deleteParcelsImportAction')}
            actionColor="red"
            onAction={() => deleteParcelsImport()}
          />
        </>
      )}
    </Container>
  )
}
