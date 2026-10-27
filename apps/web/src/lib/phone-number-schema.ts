import parsePhoneNumber from 'libphonenumber-js'
import { z } from 'zod'

import i18n from './i18n'

export const phoneNumberSchema = z
  .string({ error: () => i18n.t('validation:phoneNumber.required') })
  .trim()
  .min(1, { error: () => i18n.t('validation:phoneNumber.required') })
  .transform((input, ctx): string => {
    const phoneNumber = parsePhoneNumber(input, { extract: false })

    if (!phoneNumber?.isValid() || phoneNumber.ext) {
      ctx.addIssue({
        code: 'custom',
        message: i18n.t('validation:phoneNumber.invalid'),
      })
      return z.NEVER
    }

    return phoneNumber.number
  })
