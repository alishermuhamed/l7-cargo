import { Box, Container, Flex } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'

import { SearchField } from '../../../../components/search-field/search-field'
import { ClientCardsList } from '../../../../features/clients/components/client-cards-list'
import { ClientsTable } from '../../../../features/clients/components/clients-table'
import i18n from '../../../../lib/i18n'
import { listSearchSchema } from '../../../../lib/list-search'

export const Route = createFileRoute('/_authenticated/admin/clients/')({
  validateSearch: listSearchSchema,
  staticData: {
    title: i18n.t('nav:clients'),
  },
  component: AdminClientsPage,
})

function AdminClientsPage() {
  const { search = '', page = 1 } = Route.useSearch()
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
        <Box maxWidth="400px">
          <SearchField value={search} onChange={setSearch} />
        </Box>

        <Box display={{ initial: 'block', xs: 'none' }}>
          <ClientCardsList search={search} />
        </Box>

        <Box display={{ initial: 'none', xs: 'block' }}>
          <ClientsTable
            search={search}
            page={page - 1}
            onPageChange={setPage}
          />
        </Box>
      </Flex>
    </Container>
  )
}
