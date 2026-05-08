export const USER_ROLES = ['admin', 'client'] as const

export type UserRole = (typeof USER_ROLES)[number]

export const DEFAULT_USER_ROLE: UserRole = 'client'
