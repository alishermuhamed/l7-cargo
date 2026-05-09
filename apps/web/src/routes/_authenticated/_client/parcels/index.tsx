import './index.css'

import { PlusIcon } from '@radix-ui/react-icons'
import { Box, Container, Flex } from '@radix-ui/themes'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '../../../../components/button'
import { SearchField } from '../../../../components/search-field/search-field'
import { Select } from '../../../../components/select'
import { ParcelCardsList } from '../../../../features/parcels/components/parcel-cards-list'
import { ParcelsTable } from '../../../../features/parcels/components/parcels-table'
import { ReadyForPickupBalance } from '../../../../features/parcels/components/ready-for-pickup-balance'
import { PARCEL_STATUS_LABELS } from '../../../../features/parcels/lib/parcel-status-labels'
import { ParcelStatus } from '../../../../lib/api/api.gen'
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
  const parcelStatuses = Object.values(ParcelStatus)
  const normalizedStatus = status === 'all' ? undefined : status

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

        <Box display={{ initial: 'block', xs: 'none' }}>
          <ParcelCardsList search={search} status={normalizedStatus} />
        </Box>

        <Box display={{ initial: 'none', xs: 'block' }}>
          <ParcelsTable search={search} status={normalizedStatus} />
        </Box>
      </Flex>
    </Container>
  )
}
