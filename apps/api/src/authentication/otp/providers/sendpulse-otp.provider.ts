import { BadGatewayException, Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../../config/config.service'
import { OtpProvider } from './otp.provider'

interface SendPulseSmsSendSuccessResponse {
  result: true
  campaign_id: number
  counters?: {
    exceptions: number
    sends: number
  }
}

interface SendPulseSmsSendFailureResponse {
  result: false
  error?: string
  message?: string
}

type SendPulseSmsSendResponse =
  | SendPulseSmsSendSuccessResponse
  | SendPulseSmsSendFailureResponse

type SendPulseSmsSendResponseBody =
  | SendPulseSmsSendResponse
  | SendPulseSmsSendResponse[]

@Injectable()
export class SendPulseOtpProvider extends OtpProvider {
  readonly name = 'sendpulse'

  private readonly logger = new Logger(SendPulseOtpProvider.name)

  private readonly apiBaseUrl = 'https://api.sendpulse.com'
  private readonly apiKey: string | undefined

  constructor(private readonly configService: ConfigService) {
    super()
    this.apiKey = this.configService.get('otp.sendpulse.apiKey')
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
      throw new BadGatewayException('SendPulse is not configured')
    }

    const normalizedPhoneNumber = this.formatPhoneNumber(phoneNumber)
    const url = new URL('/sms/send', this.apiBaseUrl)

    const response = await this.post({
      abortAfterMs: 10_000,
      url: url.toString(),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phones: [normalizedPhoneNumber],
        body: this.buildMessage(code),
        route: { KZ: 'international' },
      }),
    })

    const responseJson = (await response.json()) as SendPulseSmsSendResponseBody
    const normalizedResponse = Array.isArray(responseJson)
      ? responseJson[0]
      : responseJson

    if (
      !response.ok ||
      !SendPulseOtpProvider.isSuccessResponse(normalizedResponse)
    ) {
      this.logger.error(
        `SendPulse request failed for ${normalizedPhoneNumber}: ${JSON.stringify(responseJson)}`
      )
      throw new BadGatewayException('Failed to send OTP')
    }
  }

  private static isSuccessResponse(
    response: unknown
  ): response is SendPulseSmsSendSuccessResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      'result' in response &&
      response.result === true &&
      'campaign_id' in response &&
      typeof response.campaign_id === 'number'
    )
  }
}
