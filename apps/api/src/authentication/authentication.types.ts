export const SIGN_IN_METHODS = ['password', 'otp'] as const

export type SignInMethod = (typeof SIGN_IN_METHODS)[number]
