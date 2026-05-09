import './admin-nav-bar.css'

import { Box, Flex, Heading, Link, Text } from '@radix-ui/themes'
import { Link as RouterLink } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'

import i18n from '../../lib/i18n'

interface AdminNavBarProps {
  onNavigate?: () => void
}

export function AdminNavBar({ onNavigate }: AdminNavBarProps) {
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
            <RouterLink onClick={onNavigate} to="/admin/parcels">
              <Text size="3">{i18n.t('nav:parcels')}</Text>
            </RouterLink>
          </RouterLinkWrapper>

          <RouterLinkWrapper>
            <RouterLink onClick={onNavigate} to="/admin/customers">
              <Text size="3">{i18n.t('nav:customers')}</Text>
            </RouterLink>
          </RouterLinkWrapper>
        </Flex>
      </Flex>
    </Flex>
  )
}

function RouterLinkWrapper({ children }: PropsWithChildren) {
  return (
    <Box asChild py="2" px="3" className="admin-nav-bar-link">
      <Link asChild>{children}</Link>
    </Box>
  )
}
