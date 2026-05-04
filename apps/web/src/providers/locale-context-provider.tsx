import { type PropsWithChildren, useEffect, useState } from 'react'

import { LocaleContext } from '../contexts/locale'
import i18n, { type Language, SUPPORTED_LANGUAGES } from '../lib/i18n'

function normalizeLanguage(lang: string): Language {
  const code = lang.split('-')[0] as Language
  return SUPPORTED_LANGUAGES.includes(code) ? code : 'en'
}

export function LocaleContextProvider({ children }: PropsWithChildren) {
  const [language] = useState<Language>(() =>
    normalizeLanguage(i18n.resolvedLanguage ?? i18n.language)
  )

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = async (next: Language) => {
    await i18n.changeLanguage(next)
    window.location.reload()
  }

  return (
    <LocaleContext.Provider value={{ language, setLanguage }}>
      {children}
    </LocaleContext.Provider>
  )
}
