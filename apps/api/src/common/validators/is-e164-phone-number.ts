import { ValidateBy, type ValidationOptions } from 'class-validator'

import { isE164PhoneNumber } from '../phone-number'

export function IsE164PhoneNumber(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isE164PhoneNumber',
      validator: {
        validate: (value: unknown): boolean => isE164PhoneNumber(value),
        defaultMessage: (): string =>
          '$property must be a valid phone number in E.164 format',
      },
    },
    validationOptions
  )
}
