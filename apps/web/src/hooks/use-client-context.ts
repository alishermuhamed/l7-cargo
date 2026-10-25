import { useContext } from 'react'

import { ClientContext } from '../contexts/client'

export function useClientContext() {
  const client = useContext(ClientContext)

  if (!client) {
    throw new Error('useClientContext must be used within ClientContext')
  }

  return client
}
