import { PlusIcon } from '@radix-ui/react-icons'
import { Box, Container, Flex } from '@radix-ui/themes'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '../../../../components/button'
import { SearchField } from '../../../../components/search-field/search-field'
import { Select } from '../../../../components/select/select'
import { ParcelCardsList } from '../../../../features/parcels/components/parcel-cards-list'
import { ParcelsTable } from '../../../../features/parcels/components/parcels-table'
import { PARCEL_STATUS_LABELS } from '../../../../features/parcels/lib/parcel-status-labels'
import { ParcelStatus } from '../../../../lib/api/api.gen'
import i18n from '../../../../lib/i18n'

export const Route = createFileRoute('/_authenticated/admin/parcels/')({
  staticData: {
    title: i18n.t('parcels:parcels'),
  },
  component: AdminParcelsPage,
})

function AdminParcelsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ParcelStatus | 'all'>('all')

  return (
    <Container p="4">
      <Flex direction="column" gap="4">
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
              <Select
                value={status}
                onValueChange={setStatus}
                items={[
                  { label: i18n.t('parcels:all'), value: 'all' },
                  ...Object.values(ParcelStatus).map((parcelStatus) => ({
                    label: PARCEL_STATUS_LABELS[parcelStatus],
                    value: parcelStatus,
                  })),
                ]}
              />
            </Box>
          </Flex>

          <Flex direction={{ initial: 'column', xs: 'row' }} flexShrink="0">
            <Button asChild>
              <Link to="/admin/parcels/add">
                <PlusIcon /> {i18n.t('parcels:addParcel')}
              </Link>
            </Button>
          </Flex>
        </Flex>

        <Box display={{ initial: 'block', xs: 'none' }}>
          <ParcelCardsList
            search={search}
            status={status === 'all' ? undefined : status}
            isAdminPage
          />
        </Box>

        <Box display={{ initial: 'none', xs: 'block' }}>
          <ParcelsTable
            search={search}
            status={status === 'all' ? undefined : status}
            isAdminPage
          />
        </Box>
      </Flex>
    </Container>
  )
}
