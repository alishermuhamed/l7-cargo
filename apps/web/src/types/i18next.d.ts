import 'i18next'

type Common = typeof import('../locales/en/common.json')
type Validation = typeof import('../locales/en/validation.json')
type Auth = typeof import('../locales/en/auth.json')
type Nav = typeof import('../locales/en/nav.json')
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
      profile: Profile
      errors: Errors
    }
  }
}
