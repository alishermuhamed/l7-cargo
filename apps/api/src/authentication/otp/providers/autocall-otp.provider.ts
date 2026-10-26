import { BadGatewayException, Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../../config/config.service'
import { OtpProvider } from './otp.provider'

const CHANNELS = ['telegram', 'whatsapp', 'sms'] as const

type AutocallChannel = (typeof CHANNELS)[number]

interface AutocallOtpResponse {
  id: number
  channel: AutocallChannel
  number: string
  code: string
  language: string
  brand: string
  brand_status: 'approved' | 'pending' | 'rejected'
  status:
    | 'pending'
    | 'sent'
    | 'delivered'
    | 'read'
    | 'verified'
    | 'expired'
    | 'failed'
  reason: string | null
  cost: number | null
  created_at: string
}

@Injectable()
export class AutocallOtpProvider extends OtpProvider {
  readonly name = 'autocall'

  private readonly logger = new Logger(AutocallOtpProvider.name)
  private readonly apiBaseUrl = 'https://autocall.kz/api/v1'
  private readonly apiToken: string | undefined

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
  }: {
    phoneNumber: string
    code: string
  }): Promise<void> {
    if (!this.isConfigured) {
      throw new BadGatewayException('Autocall is not configured')
    }

    const normalizedPhoneNumber = this.formatPhoneNumber(phoneNumber)

    for (const channel of CHANNELS) {
      const createOtpUrl = new URL(`${this.apiBaseUrl}/otp/${channel}`)

      let otpId: number

      try {
        const createOtpResponse = await this.post({
          url: createOtpUrl.toString(),
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            number: normalizedPhoneNumber,
            code,
            language: 'ru',
            brand: 'L7 Cargo',
            ttl: 300,
          }),
        })

        if (!createOtpResponse.ok) {
          this.logger.warn(
            `Failed to create OTP in ${channel} channel: HTTP ${createOtpResponse.status}`
          )
          continue
        }

        const createOtpResponseJson =
          (await createOtpResponse.json()) as AutocallOtpResponse

        if (
          createOtpResponseJson.status === 'failed' ||
          createOtpResponseJson.status === 'expired'
        ) {
          continue
        }

        if (
          createOtpResponseJson.status === 'delivered' ||
          createOtpResponseJson.status === 'read' ||
          createOtpResponseJson.status === 'verified'
        ) {
          return
        }

        otpId = createOtpResponseJson.id
      } catch (error: unknown) {
        this.logger.error(`Failed to create OTP in ${channel} channel`, error)
        continue
      }

      let checksCount = 0

      while (checksCount < 3) {
        checksCount++
        await new Promise((res) => setTimeout(res, 10_000))

        const checkOtpUrl = new URL(`${this.apiBaseUrl}/otp/${otpId}`)

        try {
          const checkOtpResponse = await this.get({
            url: checkOtpUrl.toString(),
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
              Accept: 'application/json',
            },
          })

          if (!checkOtpResponse.ok) {
            this.logger.warn(
              `Failed to check OTP with ID ${otpId}: HTTP ${checkOtpResponse.status}`
            )
            continue
          }

          const checkOtpResponseJson =
            (await checkOtpResponse.json()) as AutocallOtpResponse

          if (
            checkOtpResponseJson.status === 'failed' ||
            checkOtpResponseJson.status === 'expired'
          ) {
            break
          }

          if (
            checkOtpResponseJson.status === 'delivered' ||
            checkOtpResponseJson.status === 'read' ||
            checkOtpResponseJson.status === 'verified'
          ) {
            return
          }
        } catch (error: unknown) {
          this.logger.error(`Failed to check OTP with ID ${otpId}`, error)
        }
      }
    }

    throw new BadGatewayException('Failed to send OTP')
  }
}
