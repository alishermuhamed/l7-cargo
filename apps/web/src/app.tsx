import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast'

import { DRAWER_PORTAL_ROOT_ID, SCROLL_CONTAINER_CLASS } from './lib/constants'
import { LocaleContextProvider } from './providers/locale-context-provider'
import { ThemeContextProvider } from './providers/theme-context-provider'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
  mutationCache: new MutationCache({
    // TODO: use fine-grained invalidation
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  }),
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  scrollRestoration: true,
  scrollToTopSelectors: [`.${SCROLL_CONTAINER_CLASS}`],
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App() {
  return (
    <ThemeContextProvider>
      <LocaleContextProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <div id={DRAWER_PORTAL_ROOT_ID} />
          <Toaster />
        </QueryClientProvider>
      </LocaleContextProvider>
    </ThemeContextProvider>
  )
}
