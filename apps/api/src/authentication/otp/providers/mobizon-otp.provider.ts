import { BadGatewayException, Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../../config/config.service'
import { OtpProvider } from './otp.provider'

interface MobizonSendSmsResponseData {
  campaignId: number
  messageId: number
  status: number
}

interface MobizonApiResponse {
  code: number
  data: MobizonSendSmsResponseData
  message: string
}

@Injectable()
export class MobizonOtpProvider extends OtpProvider {
  readonly name = 'mobizon'

  private readonly logger = new Logger(MobizonOtpProvider.name)

  private readonly apiBaseUrl = 'https://api.mobizon.kz'
  private readonly apiKey: string | undefined

  constructor(private readonly configService: ConfigService) {
    super()
    this.apiKey = this.configService.get('otp.mobizon.apiKey')
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey)
  }

  async send({
    phoneNumber,
    code,
  }: {
    phoneNumber: string
    code: string
  }): Promise<void> {
    if (!this.apiKey) {
      throw new BadGatewayException('Mobizon is not configured')
    }

    const normalizedPhoneNumber = this.normalizePhoneNumber(phoneNumber)
    const url = new URL('/service/message/sendSmsMessage', this.apiBaseUrl)

    url.searchParams.set('output', 'json')
    url.searchParams.set('api', 'v1')
    url.searchParams.set('apiKey', this.apiKey)

    const body = new URLSearchParams({
      recipient: normalizedPhoneNumber,
      text: this.buildMessage(code),
      'params[validity]': '60',
    })

    const response = await this.post({
      abortAfterMs: 10_000,
      url: url.toString(),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const responseJson = (await response.json()) as MobizonApiResponse

    if (!response.ok || responseJson.code !== 0) {
      this.logger.error(
        `Mobizon request failed for ${normalizedPhoneNumber}: ${JSON.stringify(responseJson)}`
      )
      throw new BadGatewayException('Failed to send OTP')
    }
  }

  private normalizePhoneNumber(phoneNumber: string): string {
    return this.formatPhoneNumber(phoneNumber).replace(/\D/g, '')
  }
}
