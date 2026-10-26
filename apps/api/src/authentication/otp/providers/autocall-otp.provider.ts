import { randomUUID } from 'node:crypto'
import { setTimeout } from 'node:timers/promises'

import { BadGatewayException, Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../../config/config.service'
import { OtpProvider } from './otp.provider'

const CHANNELS = ['telegram', 'whatsapp', 'sms'] as const
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
  constructor(
    readonly retryable: boolean,
    readonly diagnostic: string = 'provider_rejected'
  ) {
    super('Failed to send OTP')
  }
}

@Injectable()
export class AutocallOtpProvider extends OtpProvider {
  readonly name = 'autocall'

  private readonly logger = new Logger(AutocallOtpProvider.name)
  private readonly apiBaseUrl = 'https://autocall.kz/api/v1'
  private readonly apiToken: string | undefined
  private readonly channelTimeoutMs = 10_000
  private readonly pollIntervalMs = 1_000

  constructor(configService: ConfigService) {
    super()
    this.apiToken = configService.get('otp.autocall.apiToken')
  }

  get isConfigured(): boolean {
    return Boolean(this.apiToken)
  }

  async send({
    phoneNumber,
    code,
    deliveryId = randomUUID(),
  }: {
    phoneNumber: string
    code: string
    deliveryId?: string
  }): Promise<void> {
    if (!this.apiToken) {
      throw new BadGatewayException('Autocall is not configured')
    }

    const number = this.formatPhoneNumber(phoneNumber)
    const expiresAt = Date.now() + 300_000

    for (const channel of CHANNELS) {
      const startedAt = Date.now()
      const context = { deliveryId, channel }
      let lastOtp: AutocallOtp | undefined
      this.logger.log({ event: 'otp.channel.started', ...context })
      const deadline = Date.now() + this.channelTimeoutMs

      try {
        let otp = await this.request({
          path: `/otp/${channel}`,
          channel,
          number,
          code,
          deadline,
          deliveryId,
          ttl: Math.floor((expiresAt - Date.now()) / 1_000),
        })

        while (true) {
          if (
            lastOtp?.status !== otp.status ||
            lastOtp?.reason !== otp.reason
          ) {
            this.logger.log({
              event: 'otp.channel.status',
              ...context,
              otpId: otp.id,
              status: otp.status,
              reason: AutocallOtpProvider.machineCode(otp.reason),
              elapsedMs: Date.now() - startedAt,
            })
          }
          lastOtp = otp
          if (['delivered', 'read', 'verified'].includes(otp.status)) {
            this.logger.log({
              event: 'otp.channel.completed',
              ...context,
              otpId: otp.id,
              status: otp.status,
              reason: AutocallOtpProvider.machineCode(otp.reason),
            })
            return
          }

          // A newer request or explicit revocation must not revive this code.
          if (otp.reason === 'replaced' || otp.reason === 'revoked') {
            this.logger.log({
              event: 'otp.channel.completed',
              ...context,
              otpId: otp.id,
              status: otp.status,
              reason: AutocallOtpProvider.machineCode(otp.reason),
            })
            return
          }

          if (
            otp.reason === 'invalid_number' ||
            otp.reason === 'too_many_attempts'
          ) {
            throw new AutocallRequestError(false, otp.reason)
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
            deliveryId,
            id: otp.id,
          })
        }

        this.logger.warn({
          event: 'otp.channel.unconfirmed',
          ...context,
          otpId: otp.id,
          status: otp.status,
          reason: AutocallOtpProvider.machineCode(otp.reason),
          cause: ['failed', 'expired'].includes(otp.status)
            ? 'terminal_status'
            : 'delivery_timeout',
          elapsedMs: Date.now() - startedAt,
          nextChannel: CHANNELS[CHANNELS.indexOf(channel) + 1] ?? null,
        })
      } catch (error: unknown) {
        const retryable =
          !(error instanceof AutocallRequestError) || error.retryable
        this.logger.warn({
          event: 'otp.channel.failed',
          ...context,
          otpId: lastOtp?.id ?? null,
          status: lastOtp?.status ?? null,
          reason: AutocallOtpProvider.machineCode(lastOtp?.reason),
          cause:
            error instanceof AutocallRequestError
              ? error.diagnostic
              : error instanceof Error &&
                  [
                    'TimeoutError',
                    'AbortError',
                    'SyntaxError',
                    'TypeError',
                  ].includes(error.name)
                ? error.name
                : 'unexpected_error',
          elapsedMs: Date.now() - startedAt,
          nextChannel: retryable
            ? (CHANNELS[CHANNELS.indexOf(channel) + 1] ?? null)
            : null,
          cascadeStopped: !retryable,
        })
        if (error instanceof AutocallRequestError && !error.retryable) {
          throw error
        }
      }
    }

    throw new BadGatewayException('Failed to send OTP')
  }

  private async request({
    path,
    channel,
    number,
    code,
    deadline,
    ttl,
    id,
    deliveryId,
  }: {
    path: string
    channel: AutocallChannel
    number: string
    code: string
    deadline: number
    ttl?: number
    deliveryId: string
    id?: number
  }): Promise<AutocallOtp> {
    const remainingMs = deadline - Date.now()
    if (remainingMs <= 0) {
      throw new AutocallRequestError(true, 'request_deadline_exceeded')
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
      // Only log machine-readable fields; response bodies can contain OTPs.
      const body: unknown = await response.json().catch((): null => null)
      const details = typeof body === 'object' && body !== null ? body : {}
      this.logger.warn({
        event: 'otp.request.rejected',
        deliveryId,
        channel,
        operation: ttl === undefined ? 'status' : 'create',
        otpId: id ?? null,
        httpStatus: response.status,
        error: AutocallOtpProvider.machineCode(
          'error' in details ? details.error : undefined
        ),
        reason: AutocallOtpProvider.machineCode(
          'reason' in details ? details.reason : undefined
        ),
        retryAfter:
          'retry_after' in details && typeof details.retry_after === 'number'
            ? details.retry_after
            : null,
      })
      // Changing channels cannot fix credentials, balance or a shared rate limit.
      throw new AutocallRequestError(
        ![401, 402, 403, 429].includes(response.status),
        `http_${response.status}`
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
      throw new AutocallRequestError(
        true,
        !AutocallOtpProvider.isOtp(body)
          ? 'invalid_response_shape'
          : body.channel !== channel
            ? 'channel_mismatch'
            : body.number !== number
              ? 'number_mismatch'
              : body.code !== code
                ? 'code_mismatch'
                : 'id_mismatch'
      )
    }

    return body
  }

  private static machineCode(value: unknown): string | null {
    return typeof value === 'string' && /^[a-z_]{1,64}$/.test(value)
      ? value
      : null
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
