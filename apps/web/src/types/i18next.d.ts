import 'i18next'

type Common = typeof import('../locales/en/common.json')
type Validation = typeof import('../locales/en/validation.json')
type Auth = typeof import('../locales/en/auth.json')
type Nav = typeof import('../locales/en/nav.json')
type Address = typeof import('../locales/en/address.json')
type Parcels = typeof import('../locales/en/parcels.json')
type Clients = typeof import('../locales/en/clients.json')
type Profile = typeof import('../locales/en/profile.json')
type Errors = typeof import('../locales/en/errors.json')

declare module 'i18next' {
  interface CustomTypeOptions {
    strictKeyChecks: true
    defaultNS: 'common'
    resources: {
      common: Common
      validation: Validation
      auth: Auth
      nav: Nav
      address: Address
      parcels: Parcels
      clients: Clients
      profile: Profile
      errors: Errors
    }
  }
}
