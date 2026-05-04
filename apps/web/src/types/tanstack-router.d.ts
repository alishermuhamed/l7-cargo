import type { LinkProps } from '@tanstack/react-router'

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    title?: string
    fallbackTo?: LinkProps['to']
  }
}
