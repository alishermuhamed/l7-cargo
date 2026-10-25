import BigNumber from 'bignumber.js'

import { normalizeDecimalSeparator } from './decimal'
import i18n from './i18n'

export const MONEY_AMOUNT_PATTERN = /^(?:0|[1-9]\d{0,9})(?:[.,]\d{1,4})?$/

export function isValidMoneyAmount(amount: string): boolean {
  return MONEY_AMOUNT_PATTERN.test(amount.trim())
}

export function normalizeMoneyAmount(amount: string): string {
  return new BigNumber(normalizeDecimalSeparator(amount.trim())).toFixed()
}

export function addMoneyAmounts(amounts: string[]): string {
  return amounts
    .reduce((total, amount) => total.plus(amount), new BigNumber(0))
    .toFixed()
}

export function formatMoneyAmount(
  amount: number | string,
  currency: string
): string {
  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'en'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(new BigNumber(amount).toNumber())
}
