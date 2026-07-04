import './client-nav-bar.css'

import { Box, Flex, Heading, Link, Text } from '@radix-ui/themes'
import { Link as RouterLink } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'

import { useSessionContext } from '../../hooks/use-session-context'
import i18n from '../../lib/i18n'

interface ClientNavBarProps {
  onNavigate?: () => void
}

export function ClientNavBar({ onNavigate }: ClientNavBarProps) {
  const {
    session: { user },
  } = useSessionContext()

  return (
    <Flex direction="column" justify="between" p="3" height="100%">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="1">
          <Heading>L7 Cargo</Heading>

          <Text size="2" color="gray">
            {i18n.t('profile:clientId')}: {user.clientId}
          </Text>
        </Flex>

        <Flex
          aria-label={i18n.t('common:navigation')}
          direction="column"
          gap="2"
        >
          <RouterLinkWrapper>
            <RouterLink onClick={onNavigate} to="/parcels">
              <Text size="3">{i18n.t('nav:parcels')}</Text>
            </RouterLink>
          </RouterLinkWrapper>

          <RouterLinkWrapper>
            <RouterLink onClick={onNavigate} to="/address">
              <Text size="3">{i18n.t('nav:address')}</Text>
            </RouterLink>
          </RouterLinkWrapper>
        </Flex>
      </Flex>
    </Flex>
  )
}

function RouterLinkWrapper({ children }: PropsWithChildren) {
  return (
    <Box asChild py="2" px="3" className="client-nav-bar-link">
      <Link asChild>{children}</Link>
    </Box>
  )
}
