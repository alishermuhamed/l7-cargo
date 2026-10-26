import { BadRequestException, HttpException, Injectable } from '@nestjs/common'
import { APIError } from 'better-auth/api'
import { fromNodeHeaders } from 'better-auth/node'
import type { IncomingHttpHeaders } from 'http'
import parsePhoneNumberFromString from 'libphonenumber-js'
import { IsNull, Not } from 'typeorm'

import { ClientsService } from '../clients/clients.service'
import { ConfigService } from '../config/config.service'
import { BetterAuthTypeOrmAdapter } from '../db/adapters/better-auth-typeorm.adapter'
import { AccountsRepository } from './accounts.repository'
import type { SignInMethod } from './authentication.types'
import { createBetterAuth } from './better-auth.factory'
import { OtpDeliveryService } from './otp/otp-delivery.service'
import { RegistrationNotificationService } from './registration-notification.service'

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
      resolveClientIdForNewUser: (phoneNumber) =>
        this.resolveClientIdForNewUser(phoneNumber),
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

    const accountWithPassword = await this.accountsRepository.findOne({
      where: {
        providerId: 'credential',
        password: Not(IsNull()),
        user: { phoneNumber: phoneNumber.number },
      },
    })

    return accountWithPassword ? 'password' : 'otp'
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

  private async resolveClientIdForNewUser(
    phoneNumber: unknown
  ): Promise<string> {
    const client = await this.clientsService.resolveForNewUser(phoneNumber)
    return client.id
  }
}
