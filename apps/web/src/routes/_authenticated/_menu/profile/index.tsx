import { Button, Card, Container, DataList, Flex } from '@radix-ui/themes'
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'

import i18n from '../../../../lib/i18n'
import { formatPhoneNumber } from '../../../../lib/phone-number'

export const Route = createFileRoute('/_authenticated/_menu/profile/')({
  staticData: {
    title: i18n.t('profile:profile'),
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { session } = Route.useRouteContext()

  const phoneNumber = formatPhoneNumber(session.user.phoneNumber ?? '')

  return (
    <Container size="1" pt="9" px="4">
      <Card size="3">
        <Flex direction="column" gap="5">
          <DataList.Root>
            <DataList.Item>
              <DataList.Label>{i18n.t('profile:name')}</DataList.Label>
              <DataList.Value>{session.user.name}</DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label>{i18n.t('auth:phoneNumber')}</DataList.Label>
              <DataList.Value>{phoneNumber}</DataList.Value>
            </DataList.Item>
          </DataList.Root>

          <Flex justify="end">
            <Button asChild>
              <RouterLink to="/profile/edit">
                {i18n.t('profile:editProfile')}
              </RouterLink>
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Container>
  )
}
