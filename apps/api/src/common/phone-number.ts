import parsePhoneNumberFromString from 'libphonenumber-js'

export function isE164PhoneNumber(input: unknown): input is string {
  if (typeof input !== 'string') {
    return false
  }

  const phoneNumber = parsePhoneNumberFromString(input)
  return phoneNumber?.isValid() === true && phoneNumber.number === input
}
