import './route.css'

import { Box, Flex } from '@radix-ui/themes'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useState } from 'react'

import { ClientNavBar } from '../../../components/client-nav-bar/client-nav-bar'
import { Drawer } from '../../../components/drawer/drawer'
import { Header } from '../../../components/header/header'
import { ClientContext } from '../../../contexts/client'
import { UserRole } from '../../../lib/api/api.gen'
import { getClientQueryOptions } from '../../../lib/api/queries'
import { SCROLL_CONTAINER_CLASS } from '../../../lib/constants'
import i18n from '../../../lib/i18n'

export const Route = createFileRoute('/_authenticated/_client')({
  staticData: {
    title: 'L7 Cargo',
  },
  beforeLoad: async ({ context: { queryClient, session } }) => {
    if (session.user.role === UserRole.admin) {
      throw redirect({
        to: '/admin/parcels',
        replace: true,
      })
    }

    const client = await queryClient.ensureQueryData(
      getClientQueryOptions(session.user.clientId)
    )

    return { client }
  },
  component: ClientLayout,
})

function ClientLayout() {
  const { client } = Route.useRouteContext()
  const [isNavBarOpen, setIsNavBarOpen] = useState(false)

  return (
    <ClientContext.Provider value={client}>
      <Flex height="100vh" overflow="hidden">
        <Box
          className="client-nav-bar-container"
          display={{ initial: 'none', md: 'block' }}
          width="280px"
          flexShrink="0"
        >
          <ClientNavBar />
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
        <ClientNavBar onNavigate={() => setIsNavBarOpen(false)} />
      </Drawer>
    </ClientContext.Provider>
  )
}
