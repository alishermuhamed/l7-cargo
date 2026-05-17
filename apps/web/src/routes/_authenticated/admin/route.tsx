import './route.css'

import { Box, Flex } from '@radix-ui/themes'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useState } from 'react'

import { AdminNavBar } from '../../../components/admin-nav-bar/admin-nav-bar'
import { Drawer } from '../../../components/drawer/drawer'
import { Header } from '../../../components/header/header'
import { UserRole } from '../../../lib/api/api.gen'
import { SCROLL_CONTAINER_CLASS } from '../../../lib/constants'
import i18n from '../../../lib/i18n'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context: { session } }) => {
    if (session.user.role !== UserRole.admin) {
      throw redirect({
        to: '/parcels',
        replace: true,
      })
    }
  },
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

        <Box
          className={SCROLL_CONTAINER_CLASS}
          flexGrow="1"
          minWidth="0"
          minHeight="0"
          overflowY="auto"
        >
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
