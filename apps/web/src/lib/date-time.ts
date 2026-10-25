import i18n from './i18n'

export function formatDateTime(value: string) {
  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'en'

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatDate(value: string) {
  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'en'

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(new Date(`${value}T00:00:00`))
}

export function formatIsoDate(value: Date) {
  const parts = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value)

  const getPart = (type: 'year' | 'month' | 'day') =>
    parts.find((part) => part.type === type)?.value

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`
}
