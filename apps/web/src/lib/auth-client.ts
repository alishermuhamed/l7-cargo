import {
  inferAdditionalFields,
  phoneNumberClient,
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  basePath: '/auth',
  plugins: [
    phoneNumberClient(),
    inferAdditionalFields({
      user: {
        role: { type: 'string' },
        clientId: { type: 'number' },
      },
    }),
  ],
})

export type Session = typeof authClient.$Infer.Session
