import parsePhoneNumber from 'libphonenumber-js'

export function formatPhoneNumber(phoneNumber: string): string | undefined {
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber)
  return parsedPhoneNumber?.formatInternational()
}
