import { applyDecorators } from '@nestjs/common'
import BigNumber from 'bignumber.js'
import { IsString, Matches } from 'class-validator'

export const MONEY_AMOUNT_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,4})?$/

export function IsMoneyString(): PropertyDecorator {
  return applyDecorators(IsString(), Matches(MONEY_AMOUNT_PATTERN))
}

export function normalizeMoneyAmount(value: string): string {
  return new BigNumber(value).toFixed()
}

export function addMoneyAmounts(values: string[]): string {
  return values
    .reduce((total, value) => total.plus(value), new BigNumber(0))
    .toFixed()
}

export function multiplyMoneyAmount(value: string, multiplier: number): string {
  return new BigNumber(value).multipliedBy(multiplier).toFixed()
}
