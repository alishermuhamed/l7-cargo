import { useContext } from 'react'

import { ThemeContext } from '../contexts/theme'

export function useThemeContext() {
  const contextValue = useContext(ThemeContext)

  if (!contextValue) {
    throw new Error('useThemeContext must be used within ThemeContext')
  }

  return contextValue
}
