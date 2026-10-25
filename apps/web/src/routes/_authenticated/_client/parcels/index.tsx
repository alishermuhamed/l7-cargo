import { PlusIcon } from '@radix-ui/react-icons'
import { Box, Container, Flex } from '@radix-ui/themes'
import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '../../../../components/button'
import { SearchField } from '../../../../components/search-field/search-field'
import { Select } from '../../../../components/select/select'
import { ParcelCardsList } from '../../../../features/parcels/components/parcel-cards-list'
import { ParcelsTable } from '../../../../features/parcels/components/parcels-table'
import { ReadyForPickupBalance } from '../../../../features/parcels/components/ready-for-pickup-balance'
import { PARCEL_STATUS_LABELS } from '../../../../features/parcels/lib/parcel-status-labels'
import { ParcelStatus } from '../../../../lib/api/api.gen'
import i18n from '../../../../lib/i18n'
import { parcelsSearchSchema } from '../../../../lib/list-search'

export const Route = createFileRoute('/_authenticated/_client/parcels/')({
  validateSearch: parcelsSearchSchema,
  staticData: {
    title: i18n.t('parcels:parcels'),
  },
  component: ParcelsPage,
})

function ParcelsPage() {
  const { search = '', page = 1, status = 'all' } = Route.useSearch()
  const navigate = Route.useNavigate()

  const setSearch = (value: string) => {
    void navigate({
      search: (previous) => ({
        ...previous,
        search: value || undefined,
        page: undefined,
      }),
      replace: true,
      resetScroll: false,
    })
  }

  const setStatus = (value: ParcelStatus | 'all') => {
    void navigate({
      search: (previous) => ({
        ...previous,
        status: value === 'all' ? undefined : value,
        page: undefined,
      }),
      replace: true,
      resetScroll: false,
    })
  }

  const setPage = (value: number) => {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: value === 0 ? undefined : value + 1,
      }),
      replace: true,
      resetScroll: false,
    })
  }

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
              <Link to="/parcels/add">
                <PlusIcon /> {i18n.t('parcels:addParcel')}
              </Link>
            </Button>
          </Flex>
        </Flex>

        <Box display={{ initial: 'block', xs: 'none' }}>
          <ParcelCardsList
            search={search}
            status={status === 'all' ? undefined : status}
          />
        </Box>

        <Box display={{ initial: 'none', xs: 'block' }}>
          <ParcelsTable
            page={page - 1}
            onPageChange={setPage}
            search={search}
            status={status === 'all' ? undefined : status}
          />
        </Box>
      </Flex>
    </Container>
  )
}
