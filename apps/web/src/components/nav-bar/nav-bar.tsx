import './nav-bar.css'

import { Box, Flex, Heading, Link, Text } from '@radix-ui/themes'
import { Link as RouterLink } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'

import i18n from '../../lib/i18n'

interface NavBarProps {
  onNavigate?: () => void
}

export function NavBar({ onNavigate }: NavBarProps) {
  return (
    <Flex direction="column" justify="between" p="3" height="100%">
      <Flex direction="column" gap="5">
        <Heading>L7 Cargo</Heading>

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

          <RouterLinkWrapper>
            <RouterLink onClick={onNavigate} to="/profile">
              <Text size="3">{i18n.t('nav:profile')}</Text>
            </RouterLink>
          </RouterLinkWrapper>
        </Flex>
      </Flex>
    </Flex>
  )
}

function RouterLinkWrapper({ children }: PropsWithChildren) {
  return (
    <Box asChild py="2" px="3" className="nav-bar-link">
      <Link asChild>{children}</Link>
    </Box>
  )
}
