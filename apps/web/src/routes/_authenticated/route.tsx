import { Box } from '@radix-ui/themes'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { Header } from '../../components/header/header'
import { SessionContext } from '../../contexts/session'
import { authClient } from '../../lib/auth-client'
import { HeaderConfigContextProvider } from '../../providers/header-config-context-provider'

const ONBOARDING_PATH = '/onboarding'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession()

    if (!session.data) {
      throw redirect({
        to: '/auth/sign-in',
        search: { redirectTo: location.href },
      })
    }

    const { user } = session.data

    const needsOnboarding = user.name.trim() === user.phoneNumber?.trim()

    if (needsOnboarding && location.pathname !== ONBOARDING_PATH) {
      throw redirect({
        to: ONBOARDING_PATH,
        search: { redirectTo: location.href },
      })
    }

    return { session: session.data }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { session } = Route.useRouteContext()

  return (
    <SessionContext.Provider value={{ session }}>
      <HeaderConfigContextProvider>
        <Box>
          <Header />
          <Outlet />
        </Box>
      </HeaderConfigContextProvider>
    </SessionContext.Provider>
  )
}
