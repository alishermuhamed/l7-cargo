import { Injectable } from '@nestjs/common'
import {
  betterAuth as betterAuthFactory,
  type BetterAuthOptions,
} from 'better-auth'
import { fromNodeHeaders } from 'better-auth/node'
import { phoneNumber } from 'better-auth/plugins'
import type { IncomingHttpHeaders } from 'http'
import parsePhoneNumberFromString from 'libphonenumber-js'

import { ConfigService } from '../config/config.service'
import { BetterAuthTypeOrmAdapter } from '../db/adapters/better-auth-typeorm.adapter'
import { OtpDeliveryService } from './otp/otp-delivery.service'

function createBetterAuth({
  typeOrmAdapter,
  secret,
  baseURL,
  cookiesDomain,
  webUrl,
  validatePhoneNumber,
  sendOTP,
  sendPasswordResetOTP,
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
}) {
  return betterAuthFactory({
    basePath: '/auth',
    secret,
    baseURL,
    trustedOrigins: webUrl ? [webUrl] : undefined,
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
    private readonly otpDeliveryService: OtpDeliveryService
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
    })
  }

  async getSessionFromHeaders(
    headers: IncomingHttpHeaders
  ): Promise<typeof this.betterAuth.$Infer.Session | null> {
    return this.betterAuth.api.getSession({
      headers: fromNodeHeaders(headers),
    })
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
