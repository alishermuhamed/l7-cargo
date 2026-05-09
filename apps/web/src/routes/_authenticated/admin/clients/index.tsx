import { Box, Container, Flex } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { SearchField } from '../../../../components/search-field/search-field'
import { ClientCardsList } from '../../../../features/clients/components/client-cards-list'
import { ClientsTable } from '../../../../features/clients/components/clients-table'
import i18n from '../../../../lib/i18n'

export const Route = createFileRoute('/_authenticated/admin/clients/')({
  staticData: {
    title: i18n.t('nav:clients'),
  },
  component: AdminClientsPage,
})

function AdminClientsPage() {
  const [search, setSearch] = useState('')

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
          <ClientsTable search={search} />
        </Box>
      </Flex>
    </Container>
  )
}
