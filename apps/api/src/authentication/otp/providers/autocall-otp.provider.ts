import { setTimeout } from 'node:timers/promises'

import { BadGatewayException, Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../../config/config.service'
import { OtpProvider } from './otp.provider'

const CHANNELS = ['whatsapp', 'telegram', 'sms'] as const
const STATUSES = [
  'pending',
  'sent',
  'delivered',
  'read',
  'verified',
  'expired',
  'failed',
] as const

type AutocallChannel = (typeof CHANNELS)[number]
type AutocallStatus = (typeof STATUSES)[number]

interface AutocallOtp {
  id: number
  channel: AutocallChannel
  number: string
  code: string
  status: AutocallStatus
  reason?: string | null
}

class AutocallRequestError extends BadGatewayException {
  constructor(readonly retryable: boolean) {
    super('Failed to send OTP')
  }
}

@Injectable()
export class AutocallOtpProvider extends OtpProvider {
  readonly name = 'autocall'

  private readonly logger = new Logger(AutocallOtpProvider.name)
  private readonly apiBaseUrl = 'https://autocall.kz/api/v1'
  private readonly apiToken: string | undefined
  private readonly channel: string
  private readonly channelTimeoutMs = 10_000
  private readonly pollIntervalMs = 1_000

  constructor(configService: ConfigService) {
    super()
    this.apiToken = configService.get('otp.autocall.apiToken')
    this.channel = configService.get('otp.autocall.channel') || 'whatsapp'
  }

  get isConfigured(): boolean {
    return Boolean(this.apiToken)
  }

  async send({
    phoneNumber,
    code,
  }: {
    phoneNumber: string
    code: string
  }): Promise<void> {
    if (!this.apiToken) {
      throw new BadGatewayException('Autocall is not configured')
    }

    const number = this.formatPhoneNumber(phoneNumber)
    const expiresAt = Date.now() + 300_000

    for (const channel of this.getChannels()) {
      const deadline = Date.now() + this.channelTimeoutMs

      try {
        let otp = await this.request({
          path: `/otp/${channel}`,
          channel,
          number,
          code,
          deadline,
          ttl: Math.floor((expiresAt - Date.now()) / 1_000),
        })

        while (true) {
          if (['delivered', 'read', 'verified'].includes(otp.status)) {
            return
          }

          // A newer request or explicit revocation must not revive this code.
          if (otp.reason === 'replaced' || otp.reason === 'revoked') {
            return
          }

          if (
            otp.reason === 'invalid_number' ||
            otp.reason === 'too_many_attempts'
          ) {
            throw new AutocallRequestError(false)
          }

          if (otp.status === 'failed' || otp.status === 'expired') {
            break
          }

          const remainingMs = deadline - Date.now()
          if (remainingMs <= this.pollIntervalMs) {
            break
          }

          await setTimeout(this.pollIntervalMs)
          otp = await this.request({
            path: `/otp/${otp.id}`,
            channel,
            number,
            code,
            deadline,
            id: otp.id,
          })
        }

        this.logger.warn(
          `Autocall ${channel} did not confirm OTP delivery (status: ${otp.status})`
        )
      } catch (error: unknown) {
        if (error instanceof AutocallRequestError && !error.retryable) {
          throw error
        }

        // Do not log response bodies: they contain the verification code.
        this.logger.warn(`Autocall ${channel} OTP delivery failed`)
      }
    }

    throw new BadGatewayException('Failed to send OTP')
  }

  private getChannels(): AutocallChannel[] {
    const channel = CHANNELS.find((value): boolean => value === this.channel)
    if (!channel) {
      throw new BadGatewayException('Invalid Autocall OTP channel')
    }

    // Keep the configured starting channel and only fall forward, never repeat it.
    return CHANNELS.slice(CHANNELS.indexOf(channel))
  }

  private async request({
    path,
    channel,
    number,
    code,
    deadline,
    ttl,
    id,
  }: {
    path: string
    channel: AutocallChannel
    number: string
    code: string
    deadline: number
    ttl?: number
    id?: number
  }): Promise<AutocallOtp> {
    const remainingMs = deadline - Date.now()
    if (remainingMs <= 0) {
      throw new AutocallRequestError(true)
    }

    // The timeout covers response headers AND reading the JSON body.
    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      method: ttl === undefined ? 'GET' : 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(remainingMs),
      body:
        ttl === undefined
          ? undefined
          : JSON.stringify({ number, code, ttl, language: 'ru' }),
    })

    if (response.status !== (ttl === undefined ? 200 : 201)) {
      this.logger.warn(
        `Autocall ${channel} OTP request returned HTTP ${response.status}`
      )
      // Changing channels cannot fix credentials, balance or a shared rate limit.
      throw new AutocallRequestError(
        ![401, 402, 403, 429].includes(response.status)
      )
    }

    const body: unknown = await response.json()
    if (
      !AutocallOtpProvider.isOtp(body) ||
      body.channel !== channel ||
      body.number !== number ||
      body.code !== code ||
      (id !== undefined && body.id !== id)
    ) {
      throw new AutocallRequestError(true)
    }

    return body
  }

  private static isOtp(value: unknown): value is AutocallOtp {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      typeof value.id === 'number' &&
      Number.isSafeInteger(value.id) &&
      value.id > 0 &&
      'channel' in value &&
      CHANNELS.some((channel): boolean => channel === value.channel) &&
      'number' in value &&
      typeof value.number === 'string' &&
      'code' in value &&
      typeof value.code === 'string' &&
      'status' in value &&
      STATUSES.some((status): boolean => status === value.status) &&
      (!('reason' in value) ||
        value.reason === null ||
        typeof value.reason === 'string')
    )
  }
}
