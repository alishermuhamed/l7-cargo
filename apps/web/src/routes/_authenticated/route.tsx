import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { SessionContext } from '../../contexts/session'
import { UserRole } from '../../lib/api/api.gen'
import { getUserQueryOptions } from '../../lib/api/queries'
import { authClient } from '../../lib/auth-client'

const CODE_RESOLUTION_PATH = '/code-resolution'

const ONBOARDING_PATH = '/onboarding'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location, context: { queryClient } }) => {
    const session = await authClient.getSession()

    if (!session.data) {
      throw redirect({
        to: '/auth/sign-in',
        search: { redirectTo: location.href },
      })
    }

    const { user } = session.data

    const requiresCodeResolution =
      user.role !== UserRole.admin &&
      (
        await queryClient.fetchQuery({
          ...getUserQueryOptions(user.id),
          staleTime: 0,
        })
      ).requiresCodeResolution

    if (requiresCodeResolution) {
      if (location.pathname !== CODE_RESOLUTION_PATH) {
        throw redirect({ to: CODE_RESOLUTION_PATH, replace: true })
      }
      return { session: session.data }
    }

    if (location.pathname === CODE_RESOLUTION_PATH) {
      throw redirect({ to: '/', replace: true })
    }

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
