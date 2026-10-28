import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  Navigate,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => <Navigate to="/auth/sign-in" replace />,
})

function RootLayout() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  )
}
