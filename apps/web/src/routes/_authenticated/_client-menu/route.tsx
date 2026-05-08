import './route.css'

import { Box, Flex } from '@radix-ui/themes'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState } from 'react'

import { Drawer } from '../../../components/drawer/drawer'
import { Header } from '../../../components/header/header'
import { NavBar } from '../../../components/nav-bar/nav-bar'
import i18n from '../../../lib/i18n'

export const Route = createFileRoute('/_authenticated/_client-menu')({
  staticData: {
    title: 'L7 Cargo',
  },
  component: MenuLayout,
})

function MenuLayout() {
  const [isNavBarOpen, setIsNavBarOpen] = useState(false)

  return (
    <>
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
          <Header onMenuClick={() => setIsNavBarOpen(true)} />
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
    </>
  )
}
