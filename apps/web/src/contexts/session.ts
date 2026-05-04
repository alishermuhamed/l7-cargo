import { createContext } from 'react'

import type { Session } from '../lib/auth-client'

export interface SessionContextValue {
  session: Session
}

export const SessionContext = createContext<SessionContextValue | null>(null)
