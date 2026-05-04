import './header.css'

import { Box, Flex, Heading } from '@radix-ui/themes'

import { useHeaderConfigContext } from '../../hooks/use-header-config-context'
import { UserMenu } from '../user-menu'

export function Header() {
  const { config } = useHeaderConfigContext()

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
      {config.leftAction && <Box>{config.leftAction}</Box>}

      <Box flexGrow="1" minWidth="0">
        <Heading size="5" truncate>
          {config.title}
        </Heading>
      </Box>

      {config.rightAction && <Box flexShrink="0">{config.rightAction}</Box>}

      <Box minWidth="36px" flexShrink="0">
        <UserMenu />
      </Box>
    </Flex>
  )
}
