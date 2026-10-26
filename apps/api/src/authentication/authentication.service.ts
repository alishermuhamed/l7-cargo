import { BadRequestException, HttpException, Injectable } from '@nestjs/common'
import {
  betterAuth as betterAuthFactory,
  type BetterAuthOptions,
} from 'better-auth'
import { APIError } from 'better-auth/api'
import { fromNodeHeaders } from 'better-auth/node'
import { phoneNumber } from 'better-auth/plugins'
import type { IncomingHttpHeaders } from 'http'
import parsePhoneNumberFromString from 'libphonenumber-js'

import { ClientsService } from '../clients/clients.service'
import { ConfigService } from '../config/config.service'
import { BetterAuthTypeOrmAdapter } from '../db/adapters/better-auth-typeorm.adapter'
import { DEFAULT_USER_ROLE } from '../users/user-role'
import { AccountsRepository } from './accounts.repository'
import { OtpDeliveryService } from './otp/otp-delivery.service'
import { RegistrationNotificationService } from './registration-notification.service'
import type { SignInMethod } from './sign-in-method'

function createBetterAuth({
  typeOrmAdapter,
  secret,
  baseURL,
  cookiesDomain,
  webUrl,
  validatePhoneNumber,
  sendOTP,
  sendPasswordResetOTP,
  resolveClientIdForNewUser,
  notifyRegistration,
}: {
  typeOrmAdapter: BetterAuthTypeOrmAdapter
  secret: string
  baseURL: string
  cookiesDomain: string | undefined
  webUrl: string | undefined
  validatePhoneNumber: (input: string) => boolean
  sendOTP: (data: { phoneNumber: string; code: string }) => Promise<void>
  sendPasswordResetOTP: (data: {
    phoneNumber: string
    code: string
  }) => Promise<void>
  resolveClientIdForNewUser: (phoneNumber: unknown) => Promise<string>
  notifyRegistration: (user: {
    id: string
    name: string
    phoneNumber?: unknown
  }) => Promise<void>
}) {
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
        phoneNumberValidator: validatePhoneNumber,
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
          before: async (user) => ({
            data: {
              ...user,
              clientId: await resolveClientIdForNewUser(user.phoneNumber),
            },
          }),
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

@Injectable()
export class AuthenticationService {
  readonly betterAuth: ReturnType<typeof createBetterAuth>

  constructor(
    private readonly configService: ConfigService,
    private readonly betterAuthTypeOrmAdapter: BetterAuthTypeOrmAdapter,
    private readonly otpDeliveryService: OtpDeliveryService,
    private readonly clientsService: ClientsService,
    private readonly registrationNotificationService: RegistrationNotificationService,
    private readonly accountsRepository: AccountsRepository
  ) {
    this.betterAuth = createBetterAuth({
      typeOrmAdapter: this.betterAuthTypeOrmAdapter,
      secret: this.configService.getOrThrow('betterAuth.secret'),
      baseURL: this.configService.getOrThrow('betterAuth.baseUrl'),
      cookiesDomain: this.configService.get('betterAuth.cookiesDomain'),
      webUrl: this.configService.get('web.url'),
      validatePhoneNumber: (input) => this.validatePhoneNumber(input),
      sendOTP: (data) => this.sendOTP(data),
      sendPasswordResetOTP: (data) => this.sendPasswordResetOTP(data),
      resolveClientIdForNewUser: async (phoneNumber) =>
        (await this.clientsService.resolveForNewUser(phoneNumber)).id,
      notifyRegistration: (user): Promise<void> =>
        this.registrationNotificationService.send(user),
    })
  }

  async getSessionFromHeaders(
    headers: IncomingHttpHeaders
  ): Promise<typeof this.betterAuth.$Infer.Session | null> {
    return this.betterAuth.api.getSession({
      headers: fromNodeHeaders(headers),
    })
  }

  async setPassword(
    newPassword: string,
    headers: IncomingHttpHeaders
  ): Promise<void> {
    try {
      await this.betterAuth.api.setPassword({
        body: { newPassword },
        headers: fromNodeHeaders(headers),
      })
    } catch (error: unknown) {
      if (error instanceof APIError) {
        throw new HttpException(error.body ?? error.message, error.statusCode)
      }

      throw error
    }
  }

  async getSignInMethod(input: string): Promise<SignInMethod> {
    const phoneNumber = parsePhoneNumberFromString(input)

    if (!phoneNumber?.isValid()) {
      throw new BadRequestException('INVALID_PHONE_NUMBER')
    }

    const hasPassword = await this.accountsRepository.hasPasswordForPhoneNumber(
      phoneNumber.number
    )

    return hasPassword ? 'password' : 'otp'
  }

  private validatePhoneNumber(input: string): boolean {
    const phoneNumber = parsePhoneNumberFromString(input)
    return phoneNumber?.isValid() ?? false
  }

  private sendOTP({
    phoneNumber,
    code,
  }: {
    phoneNumber: string
    code: string
  }): Promise<void> {
    return this.otpDeliveryService.send({
      phoneNumber,
      code,
    })
  }

  private sendPasswordResetOTP({
    phoneNumber,
    code,
  }: {
    phoneNumber: string
    code: string
  }): Promise<void> {
    return this.otpDeliveryService.send({
      phoneNumber,
      code,
    })
  }
}
