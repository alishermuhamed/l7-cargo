import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { SessionContext } from '../../contexts/session'
import { authClient } from '../../lib/auth-client'

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
      <Outlet />
    </SessionContext.Provider>
  )
}
