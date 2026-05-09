import './route.css'

import { Box, Flex } from '@radix-ui/themes'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState } from 'react'

import { AdminNavBar } from '../../../components/admin-nav-bar/admin-nav-bar'
import { Drawer } from '../../../components/drawer/drawer'
import { Header } from '../../../components/header/header'
import i18n from '../../../lib/i18n'

export const Route = createFileRoute('/_authenticated/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const [isNavBarOpen, setIsNavBarOpen] = useState(false)

  return (
    <>
      <Flex height="100vh" overflow="hidden">
        <Box
          className="admin-nav-bar-container"
          display={{ initial: 'none', md: 'block' }}
          width="280px"
          flexShrink="0"
        >
          <AdminNavBar />
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
        <AdminNavBar onNavigate={() => setIsNavBarOpen(false)} />
      </Drawer>
    </>
  )
}
