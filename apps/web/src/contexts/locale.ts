import { createContext } from 'react'

import type { Language } from '../lib/i18n'

export interface LocaleContextValue {
  language: Language
  setLanguage: (lang: Language) => void
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)
