import { PlusIcon } from '@radix-ui/react-icons'
import { Box, Container, Flex } from '@radix-ui/themes'
import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '../../../../components/button'
import { ParcelsImportsCardsList } from '../../../../features/parcels-imports/components/parcels-imports-cards-list'
import { ParcelsImportsTable } from '../../../../features/parcels-imports/components/parcels-imports-table'
import i18n from '../../../../lib/i18n'

export const Route = createFileRoute('/_authenticated/admin/parcels-imports/')({
  staticData: {
    title: i18n.t('parcels:parcelsImports'),
  },
  component: AdminParcelsImportsPage,
})

function AdminParcelsImportsPage() {
  return (
    <Container p="4">
      <Flex direction="column" gap="4">
        <Flex
          direction={{ initial: 'column', xs: 'row' }}
          align={{ initial: 'stretch', xs: 'center' }}
          justify="end"
        >
          <Button asChild>
            <Link to="/admin/parcels-imports/add">
              <PlusIcon /> {i18n.t('parcels:addParcelsImport')}
            </Link>
          </Button>
        </Flex>

        <Box display={{ initial: 'block', xs: 'none' }}>
          <ParcelsImportsCardsList />
        </Box>

        <Box display={{ initial: 'none', xs: 'block' }}>
          <ParcelsImportsTable />
        </Box>
      </Flex>
    </Container>
  )
}
