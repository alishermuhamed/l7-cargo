import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { APIError } from 'better-auth/api'
import { hashPassword, verifyPassword } from 'better-auth/crypto'
import { fromNodeHeaders } from 'better-auth/node'
import { randomInt } from 'crypto'
import type { IncomingHttpHeaders } from 'http'
import { IsNull, Not } from 'typeorm'

import { ClientsService } from '../clients/clients.service'
import { ConfigService } from '../config/config.service'
import { BetterAuthTypeOrmAdapter } from '../db/adapters/better-auth-typeorm.adapter'
import { UsersService } from '../users/users.service'
import { AccountsRepository } from './accounts.repository'
import type { SignInMethod } from './authentication.types'
import { createBetterAuth } from './better-auth.factory'
import { OtpDeliveryService } from './otp/otp-delivery.service'
import { RegistrationNotificationService } from './registration-notification.service'
import { SessionsRepository } from './sessions.repository'

const TEMPORARY_PASSWORD_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
const TEMPORARY_PASSWORD_LENGTH = 8

@Injectable()
export class AuthenticationService {
  readonly betterAuth: ReturnType<typeof createBetterAuth>

  constructor(
    private readonly configService: ConfigService,
    private readonly betterAuthTypeOrmAdapter: BetterAuthTypeOrmAdapter,
    private readonly otpDeliveryService: OtpDeliveryService,
    private readonly clientsService: ClientsService,
    private readonly registrationNotificationService: RegistrationNotificationService,
    private readonly usersService: UsersService,
    private readonly sessionsRepository: SessionsRepository,
    private readonly accountsRepository: AccountsRepository
  ) {
    this.betterAuth = createBetterAuth({
      typeOrmAdapter: this.betterAuthTypeOrmAdapter,
      secret: this.configService.getOrThrow('betterAuth.secret'),
      baseURL: this.configService.getOrThrow('betterAuth.baseUrl'),
      cookiesDomain: this.configService.get('betterAuth.cookiesDomain'),
      webUrl: this.configService.get('web.url'),
      sendOTP: (data) => this.sendOTP(data),
      sendPasswordResetOTP: (data) => this.sendPasswordResetOTP(data),
      resolveClientIdForNewUser: (phoneNumber) =>
        this.resolveClientIdForNewUser(phoneNumber),
      onPasswordReset: ({ user }): Promise<void> =>
        this.usersService.setMustChangePassword(user.id, false),
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

  @Transactional()
  async issueTemporaryPassword(userId: string): Promise<string> {
    await this.usersService.lockForPasswordChange(userId)
    const password = Array.from({ length: TEMPORARY_PASSWORD_LENGTH }, () =>
      TEMPORARY_PASSWORD_ALPHABET.charAt(
        randomInt(TEMPORARY_PASSWORD_ALPHABET.length)
      )
    ).join('')
    await this.saveCredentialPassword(userId, await hashPassword(password))
    await this.usersService.setMustChangePassword(userId, true)
    await this.sessionsRepository.delete({ userId })
    return password
  }

  @Transactional()
  async changeTemporaryPassword(
    newPassword: string,
    headers: IncomingHttpHeaders
  ): Promise<void> {
    const session = await this.getSessionFromHeaders(headers)
    if (!session) throw new UnauthorizedException()

    const user = await this.usersService.lockForPasswordChange(session.user.id)
    // Recheck after acquiring the lock: an administrator may have reissued the password.
    const activeSession = await this.sessionsRepository.findOne({
      where: { id: session.session.id, userId: user.id },
    })
    if (!activeSession || activeSession.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException()
    }
    if (!user.mustChangePassword) {
      throw new BadRequestException('TEMPORARY_PASSWORD_NOT_REQUIRED')
    }
    const account = await this.accountsRepository.findOneOrThrow({
      where: { userId: user.id, providerId: 'credential' },
    })
    if (
      account.password &&
      (await verifyPassword({ hash: account.password, password: newPassword }))
    ) {
      throw new BadRequestException('PASSWORD_MUST_DIFFER')
    }
    await this.saveCredentialPassword(user.id, await hashPassword(newPassword))
    await this.usersService.setMustChangePassword(user.id, false)
    await this.sessionsRepository.delete({
      userId: user.id,
      id: Not(activeSession.id),
    })
  }

  private async saveCredentialPassword(
    userId: string,
    password: string
  ): Promise<void> {
    const account = await this.accountsRepository.findOne({
      where: { userId, providerId: 'credential' },
    })
    if (account) {
      await this.accountsRepository.update({ id: account.id }, { password })
    } else {
      await this.accountsRepository.insert(
        this.accountsRepository.create({
          userId,
          accountId: userId,
          providerId: 'credential',
          password,
        })
      )
    }
  }

  async getSignInMethod(phoneNumber: string): Promise<SignInMethod> {
    const accountWithPassword = await this.accountsRepository.findOne({
      where: {
        providerId: 'credential',
        password: Not(IsNull()),
        user: { phoneNumber },
      },
    })

    return accountWithPassword ? 'password' : 'otp'
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
      reason: 'sign in / sign up',
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
      reason: 'password reset',
    })
  }

  private async resolveClientIdForNewUser(
    phoneNumber: string
  ): Promise<string> {
    const client = await this.clientsService.resolveForNewUser(phoneNumber)
    return client.id
  }
}
