import { useContext } from 'react'

import { HeaderConfigContext } from '../contexts/header-config'

export function useHeaderConfigContext() {
  const contextValue = useContext(HeaderConfigContext)

  if (!contextValue) {
    throw new Error(
      'useHeaderConfigContext must be used within HeaderConfigContext'
    )
  }

  return contextValue
}
