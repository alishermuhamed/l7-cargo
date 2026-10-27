import {
  betterAuth as betterAuthFactory,
  type BetterAuthOptions,
} from 'better-auth'
import { APIError } from 'better-auth/api'
import { phoneNumber } from 'better-auth/plugins'

import { isE164PhoneNumber } from '../common/phone-number'
import type { BetterAuthTypeOrmAdapter } from '../db/adapters/better-auth-typeorm.adapter'
import { DEFAULT_USER_ROLE } from '../users/user-role'

interface CreateBetterAuthOptions {
  typeOrmAdapter: BetterAuthTypeOrmAdapter
  secret: string
  baseURL: string
  cookiesDomain: string | undefined
  webUrl: string | undefined
  sendOTP: (data: { phoneNumber: string; code: string }) => Promise<void>
  sendPasswordResetOTP: (data: {
    phoneNumber: string
    code: string
  }) => Promise<void>
  resolveClientIdForNewUser: (phoneNumber: string) => Promise<string>
  notifyRegistration: (user: {
    id: string
    name: string
    phoneNumber?: unknown
  }) => Promise<void>
}

export function createBetterAuth({
  typeOrmAdapter,
  secret,
  baseURL,
  cookiesDomain,
  webUrl,
  sendOTP,
  sendPasswordResetOTP,
  resolveClientIdForNewUser,
  notifyRegistration,
}: CreateBetterAuthOptions) {
  return betterAuthFactory({
    basePath: '/auth',
    secret,
    baseURL,
    trustedOrigins: webUrl ? [webUrl] : undefined,
    emailAndPassword: {
      enabled: false,
      revokeSessionsOnPasswordReset: true,
    },
    plugins: [
      phoneNumber({
        phoneNumberValidator: isE164PhoneNumber,
        sendOTP,
        sendPasswordResetOTP,
        signUpOnVerification: {
          getTempEmail: (phoneNumber: string): string =>
            `${phoneNumber}@phone.local`,
        },
      }),
    ],
    user: {
      additionalFields: {
        role: {
          type: 'string',
          defaultValue: DEFAULT_USER_ROLE,
          required: false,
          input: false,
        },
        clientId: {
          type: 'string',
          required: false,
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const userPhoneNumber = user.phoneNumber

            if (!isE164PhoneNumber(userPhoneNumber)) {
              throw new APIError('BAD_REQUEST', {
                message: 'INVALID_PHONE_NUMBER',
              })
            }

            return {
              data: {
                ...user,
                clientId: await resolveClientIdForNewUser(userPhoneNumber),
              },
            }
          },
          after: notifyRegistration,
        },
      },
    },
    database: (options: BetterAuthOptions) => typeOrmAdapter.build(options),
    advanced: {
      database: {
        generateId: 'uuid',
      },
      ...(cookiesDomain
        ? {
            crossSubDomainCookies: {
              enabled: true,
              domain: cookiesDomain,
            },
          }
        : {}),
    },
  })
}
