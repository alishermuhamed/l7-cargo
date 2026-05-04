import i18n from './i18n'

export function formatDateTime(value: string) {
  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'en'

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
