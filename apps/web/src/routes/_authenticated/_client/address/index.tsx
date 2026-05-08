import { Container, Text } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'

import i18n from '../../../../lib/i18n'

export const Route = createFileRoute('/_authenticated/_client/address/')({
  staticData: {
    title: i18n.t('nav:address'),
  },
  component: AddressPage,
})

function AddressPage() {
  return (
    <Container p="4">
      <Text color="gray">{i18n.t('address:comingSoon')}</Text>
    </Container>
  )
}
