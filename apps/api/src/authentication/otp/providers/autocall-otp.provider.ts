import { BadGatewayException, Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../../config/config.service'
import { OtpProvider } from './otp.provider'

type AutocallChannel = 'whatsapp' | 'sms'

@Injectable()
export class AutocallOtpProvider extends OtpProvider {
  readonly name = 'autocall'

  private readonly logger = new Logger(AutocallOtpProvider.name)
  private readonly apiBaseUrl = 'https://autocall.kz/api/v1'
  private readonly apiToken: string | undefined
  private readonly channel: string

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

    const channel = this.getChannel()
    const number = this.formatPhoneNumber(phoneNumber)

    try {
      const response = await this.post({
        abortAfterMs: 10_000,
        url: `${this.apiBaseUrl}/otp/${channel}`,
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number,
          code,
          ttl: 300,
          language: 'ru',
        }),
      })

      const body: unknown = await response.json()

      if (
        response.status !== 201 ||
        !AutocallOtpProvider.isAcceptedResponse(body, channel, number, code)
      ) {
        this.logger.warn(
          `Autocall ${channel} rejected OTP for ${number} with HTTP ${response.status}`
        )
        throw new BadGatewayException('Failed to send OTP')
      }
    } catch (error: unknown) {
      if (error instanceof BadGatewayException) {
        throw error
      }

      this.logger.error(
        `Autocall ${channel} request failed for ${number}`,
        error instanceof Error ? error.stack : String(error)
      )

      throw new BadGatewayException('Failed to send OTP')
    }
  }

  private getChannel(): AutocallChannel {
    const channel = this.channel

    if (channel !== 'whatsapp' && channel !== 'sms') {
      throw new BadGatewayException('Invalid Autocall OTP channel')
    }

    return channel
  }

  private static isAcceptedResponse(
    value: unknown,
    channel: AutocallChannel,
    number: string,
    code: string
  ): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      Number.isInteger(value.id) &&
      'channel' in value &&
      value.channel === channel &&
      'number' in value &&
      value.number === number &&
      'code' in value &&
      value.code === code &&
      'status' in value &&
      typeof value.status === 'string' &&
      ['pending', 'sent', 'delivered', 'read'].includes(value.status)
    )
  }
}
