import { BadGatewayException, Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../../config/config.service'
import { OtpProvider } from './otp.provider'

@Injectable()
export class SmscOtpProvider extends OtpProvider {
  readonly name = 'smsc'

  private readonly logger = new Logger(SmscOtpProvider.name)

  private readonly smscBaseUrl = 'https://smsc.kz'
  private readonly apiKey: string | undefined

  constructor(private readonly configService: ConfigService) {
    super()
    this.apiKey = this.configService.get('otp.smsc.apiKey')
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
      throw new BadGatewayException('SMSC is not configured')
    }

    const normalizedPhoneNumber = this.formatPhoneNumber(phoneNumber)
    const url = new URL('/rest/send/', this.smscBaseUrl)

    const response = await this.post({
      abortAfterMs: 10_000,
      url: url.toString(),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: this.apiKey,
        phones: normalizedPhoneNumber,
        mes: this.buildMessage(code),
        fmt: 3,
      }),
    })

    const responseJson = await response.json()

    if (SmscOtpProvider.isErrorResponse(responseJson)) {
      this.logger.error(
        `SMSC rejected message for ${normalizedPhoneNumber}: ${JSON.stringify(responseJson)}`
      )
      throw new BadGatewayException('Failed to send OTP')
    }

    if (!response.ok) {
      this.logger.error(`SMSC request failed: ${JSON.stringify(responseJson)}`)
      throw new BadGatewayException('Failed to send OTP')
    }
  }

  private static isErrorResponse(response: unknown): response is {
    error: string
    error_code: number
    id?: number
  } {
    return (
      typeof response === 'object' &&
      response !== null &&
      'error' in response &&
      typeof response.error === 'string' &&
      'error_code' in response &&
      typeof response.error_code === 'number'
    )
  }
}
