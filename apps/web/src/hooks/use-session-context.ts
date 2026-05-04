import { useContext } from 'react'

import { SessionContext } from '../contexts/session'

export function useSessionContext() {
  const contextValue = useContext(SessionContext)

  if (!contextValue) {
    throw new Error('useSessionContext must be used within SessionContext')
  }

  return contextValue
}
