import './route.css'

import { Box, Flex } from '@radix-ui/themes'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useState } from 'react'

import { ClientNavBar } from '../../../components/client-nav-bar/client-nav-bar'
import { Drawer } from '../../../components/drawer/drawer'
import { Header } from '../../../components/header/header'
import i18n from '../../../lib/i18n'

export const Route = createFileRoute('/_authenticated/_client')({
  staticData: {
    title: 'L7 Cargo',
  },
  beforeLoad: async ({ context: { session } }) => {
    if (session.user.role === 'admin') {
      throw redirect({
        to: '/admin/parcels',
        replace: true,
      })
    }
  },
  component: ClientLayout,
})

function ClientLayout() {
  const [isNavBarOpen, setIsNavBarOpen] = useState(false)

  return (
    <>
      <Flex height="100vh" overflow="hidden">
        <Box
          className="client-nav-bar-container"
          display={{ initial: 'none', md: 'block' }}
          width="280px"
          flexShrink="0"
        >
          <ClientNavBar />
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
        <ClientNavBar onNavigate={() => setIsNavBarOpen(false)} />
      </Drawer>
    </>
  )
}
