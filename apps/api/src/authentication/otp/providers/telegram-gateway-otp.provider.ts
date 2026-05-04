import { BadGatewayException, Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../../config/config.service'
import { OtpProvider } from './otp.provider'

interface TelegramGatewayRequestStatus {
  request_id: string
  phone_number: string
  request_cost: number
  is_refunded?: boolean
  remaining_balance?: number
  delivery_status?: {
    status: 'sent' | 'delivered' | 'read' | 'expired' | 'revoked'
    updated_at: number
  }
  verification_status?: {
    status:
      | 'code_valid'
      | 'code_invalid'
      | 'code_max_attempts_exceeded'
      | 'expired'
    updated_at: number
    code_entered?: string
  }
  payload?: string
}

interface TelegramGatewayApiSuccess<T> {
  ok: true
  result: T
}

interface TelegramGatewayApiFailure {
  ok: false
  error: string
}

type TelegramGatewayApiResponse<T> =
  | TelegramGatewayApiSuccess<T>
  | TelegramGatewayApiFailure

@Injectable()
export class TelegramGatewayOtpProvider extends OtpProvider {
  readonly name = 'telegram'

  private readonly logger = new Logger(TelegramGatewayOtpProvider.name)

  private readonly apiBaseUrl = 'https://gatewayapi.telegram.org'

  private readonly accessToken: string | undefined

  constructor(private readonly configService: ConfigService) {
    super()
    this.accessToken = this.configService.get('otp.telegramGateway.accessToken')
  }

  get isConfigured(): boolean {
    return Boolean(this.accessToken)
  }

  async send({
    phoneNumber,
    code,
  }: {
    phoneNumber: string
    code: string
  }): Promise<void> {
    if (!this.accessToken) {
      throw new BadGatewayException('Telegram Gateway is not configured')
    }

    const url = new URL('/sendVerificationMessage', this.apiBaseUrl)

    const response = await this.post({
      abortAfterMs: 10_000,
      url: url.toString(),
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        code: code,
      }),
    })

    const responseJson =
      (await response.json()) as TelegramGatewayApiResponse<TelegramGatewayRequestStatus>

    if (!response.ok || !responseJson.ok) {
      this.logger.error(
        `Telegram Gateway request failed: ${JSON.stringify(responseJson)}`
      )
      throw new BadGatewayException('Failed to send OTP')
    }
  }
}
