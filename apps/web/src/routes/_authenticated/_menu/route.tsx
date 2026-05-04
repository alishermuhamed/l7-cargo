import './route.css'

import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import { Box, Flex, IconButton } from '@radix-ui/themes'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState } from 'react'

import { Drawer } from '../../../components/drawer/drawer'
import { Header } from '../../../components/header/header'
import { HeaderSlots } from '../../../components/header/header-slots'
import { NavBar } from '../../../components/nav-bar/nav-bar'
import i18n from '../../../lib/i18n'
import { HeaderConfigContextProvider } from '../../../providers/header-config-context-provider'

export const Route = createFileRoute('/_authenticated/_menu')({
  component: MenuLayout,
})

function MenuLayout() {
  const [isNavBarOpen, setIsNavBarOpen] = useState(false)

  return (
    <HeaderConfigContextProvider>
      <HeaderSlots>
        <HeaderSlots.LeftAction>
          <Flex
            display={{ initial: 'flex', md: 'none' }}
            width="36px"
            flexShrink="0"
            align="center"
            justify="center"
          >
            <IconButton onClick={() => setIsNavBarOpen(true)}>
              <HamburgerMenuIcon />
            </IconButton>
          </Flex>
        </HeaderSlots.LeftAction>
      </HeaderSlots>

      <Flex height="100vh" overflow="hidden">
        <Box
          className="nav-bar-container"
          display={{ initial: 'none', md: 'block' }}
          width="280px"
          flexShrink="0"
        >
          <NavBar />
        </Box>

        <Box flexGrow="1" minWidth="0" minHeight="0" overflowY="auto">
          <Header />
          <Outlet />
        </Box>
      </Flex>

      <Drawer
        direction="left"
        open={isNavBarOpen}
        onOpenChange={setIsNavBarOpen}
        width="280px"
        title={i18n.t('common:navigation')}
        description={i18n.t('common:navigationSidebarDescription')}
      >
        <NavBar onNavigate={() => setIsNavBarOpen(false)} />
      </Drawer>
    </HeaderConfigContextProvider>
  )
}
