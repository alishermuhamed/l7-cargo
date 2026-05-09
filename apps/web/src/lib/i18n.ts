import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'

const NAMESPACES = [
  'common',
  'validation',
  'auth',
  'nav',
  'address',
  'parcels',
  'clients',
  'profile',
  'errors',
] as const

export type Language = 'kk' | 'ru' | 'en'

export const SUPPORTED_LANGUAGES: Language[] = ['kk', 'ru', 'en']

export const LANGUAGE_LABELS: Record<Language, string> = {
  kk: 'Қазақша',
  ru: 'Русский',
  en: 'English',
}

const LOCALE_LOCAL_STORAGE_KEY = 'language-preference'

await i18n
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`../locales/${language}/${namespace}.json`)
    )
  )
  .use(LanguageDetector)
  .init({
    load: 'languageOnly',
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: NAMESPACES,
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LOCALE_LOCAL_STORAGE_KEY,
      caches: ['localStorage'],
    },
  })

export default i18n
