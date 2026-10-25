import { Box, Table } from '@radix-ui/themes'

import type { ParsedParcelsImportRowDto } from '../../../lib/api/api.gen'
import { formatClientCode } from '../../../lib/client-code'
import i18n from '../../../lib/i18n'
import { formatMoneyAmount } from '../../../lib/money'
import { formatWeightKg } from '../../parcels/lib/format-weight'

interface ImportIssue {
  rowNumber: number
  code: string
  label: string
  row?: ParsedParcelsImportRowDto
  rawRow?: string[]
}

export function ParcelsImportIssuesTable({
  issues,
}: {
  issues: ImportIssue[]
}) {
  return (
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
            <Table.ColumnHeaderCell>
              {i18n.t('parcels:trackingNumber')}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {i18n.t('parcels:clientCode')}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {i18n.t('parcels:weight')}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {i18n.t('parcels:deliveryFee')}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {i18n.t('parcels:comments')}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {issues.map(({ rowNumber, code, label, row, rawRow }) => {
            const cells = rawRow ?? [
              row?.trackingNumber,
              row?.clientCode === undefined
                ? undefined
                : formatClientCode(row.clientCode),
              row?.weightKg === undefined
                ? undefined
                : formatWeightKg(row.weightKg),
              row?.deliveryFee === undefined
                ? undefined
                : formatMoneyAmount(row.deliveryFee, 'KZT'),
              row?.comments,
            ]

            return (
              <Table.Row key={`${rowNumber}-${code}`}>
                <Table.RowHeaderCell>{rowNumber}</Table.RowHeaderCell>
                <Table.Cell>{label}</Table.Cell>
                {Array.from({ length: 5 }, (_, index) => (
                  <Table.Cell key={index}>
                    {index === 1 && rawRow && /^\d+$/.test(rawRow[index] ?? '')
                      ? rawRow[index]?.padStart(3, '0')
                      : cells[index] === ''
                        ? '-'
                        : (cells[index] ?? '-')}
                  </Table.Cell>
                ))}
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}
