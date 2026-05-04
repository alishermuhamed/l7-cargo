import { ArrowLeftIcon } from '@radix-ui/react-icons'
import {
  Avatar,
  Button,
  Card,
  Container,
  DataList,
  Flex,
  IconButton,
} from '@radix-ui/themes'
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'

import { HeaderSlots } from '../../../components/header/header-slots'
import i18n from '../../../lib/i18n'
import { formatPhoneNumber } from '../../../lib/phone-number'

export const Route = createFileRoute('/_authenticated/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { session } = Route.useRouteContext()

  const phoneNumber = formatPhoneNumber(session.user.phoneNumber ?? '')

  return (
    <>
      <HeaderSlots>
        <HeaderSlots.LeftAction>
          <Flex width="36px" flexShrink="0" align="center" justify="center">
            <IconButton
              asChild
              variant="ghost"
              aria-label={i18n.t('common:back')}
            >
              <RouterLink to="/">
                <ArrowLeftIcon />
              </RouterLink>
            </IconButton>
          </Flex>
        </HeaderSlots.LeftAction>

        <HeaderSlots.Title>{i18n.t('profile:profile')}</HeaderSlots.Title>
      </HeaderSlots>

      <Container size="1" pt="9" px="4">
        <Card size="3">
          <Flex direction="column" gap="5">
            <Flex justify="center">
              <Avatar
                size="6"
                src={session.user.image ?? undefined}
                fallback={session.user.name.charAt(0)}
              />
            </Flex>

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
    </>
  )
}
