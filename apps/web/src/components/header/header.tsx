import './header.css'

import { ArrowLeftIcon, HamburgerMenuIcon } from '@radix-ui/react-icons'
import { Box, Flex, Heading } from '@radix-ui/themes'
import { useCanGoBack, useMatches, useRouter } from '@tanstack/react-router'

import i18n from '../../lib/i18n'
import { IconButton } from '../icon-button'
import { UserMenu } from '../user-menu'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { title, fallbackTo } = useMatches({
    select: (matches) =>
      matches.reduce<{
        title?: string
        fallbackTo?: string
      }>(
        (resolved, match) => ({
          title: match.staticData.title ?? resolved.title,
          fallbackTo: match.staticData.fallbackTo ?? resolved.fallbackTo,
        }),
        {}
      ),
  })
  const canGoBack = useCanGoBack()
  const router = useRouter()

  return (
    <Flex
      position="sticky"
      top="0"
      px="4"
      py="3"
      height="64px"
      align="center"
      gap="3"
      className="header"
    >
      {fallbackTo && (
        <Flex width="36px" flexShrink="0" align="center" justify="center">
          <IconButton
            variant="ghost"
            tooltip={i18n.t('common:back')}
            aria-label={i18n.t('common:back')}
            onClick={() => {
              if (canGoBack) {
                router.history.back()
                return
              }

              router.navigate({ to: fallbackTo, replace: true })
            }}
          >
            <ArrowLeftIcon />
          </IconButton>
        </Flex>
      )}

      {!fallbackTo && onMenuClick && (
        <Flex
          display={{ initial: 'flex', md: 'none' }}
          width="36px"
          flexShrink="0"
          align="center"
          justify="center"
        >
          <IconButton
            onClick={onMenuClick}
            tooltip={i18n.t('common:navigation')}
            aria-label={i18n.t('common:navigation')}
          >
            <HamburgerMenuIcon />
          </IconButton>
        </Flex>
      )}

      <Box flexGrow="1" minWidth="0">
        <Heading size="5" truncate>
          {title ?? 'L7 Cargo'}
        </Heading>
      </Box>

      <Box minWidth="36px" flexShrink="0">
        <UserMenu />
      </Box>
    </Flex>
  )
}
