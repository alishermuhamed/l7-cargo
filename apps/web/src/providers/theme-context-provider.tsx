import { Theme } from '@radix-ui/themes'
import { type PropsWithChildren, useEffect, useState } from 'react'

import { ThemeContext, type ThemePreference } from '../contexts/theme'

type Appearance = 'light' | 'dark'

const STORAGE_KEY = 'theme-preference'
const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)'

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

function getStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isThemePreference(stored) ? stored : 'system'
}

export function ThemeContextProvider({ children }: PropsWithChildren) {
  const [preference, setPreferenceState] =
    useState<ThemePreference>(getStoredPreference)

  const [systemAppearance, setSystemAppearance] = useState<Appearance>(() =>
    window.matchMedia(SYSTEM_DARK_QUERY).matches ? 'dark' : 'light'
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(SYSTEM_DARK_QUERY)

    const handleChange = () =>
      setSystemAppearance(mediaQuery.matches ? 'dark' : 'light')

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  const appearance: Appearance =
    preference === 'system' ? systemAppearance : preference

  const setPreference = (next: ThemePreference) => {
    localStorage.setItem(STORAGE_KEY, next)
    setPreferenceState(next)
  }

  return (
    <ThemeContext.Provider value={{ preference, setPreference }}>
      <Theme appearance={appearance}>{children}</Theme>
    </ThemeContext.Provider>
  )
}
