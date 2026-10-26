import { randomUUID } from 'node:crypto'

import { BadGatewayException, Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../config/config.service'
import { AutocallOtpProvider } from './providers/autocall-otp.provider'
import { OtpProvider } from './providers/otp.provider'

@Injectable()
export class OtpDeliveryService {
  private readonly logger = new Logger(OtpDeliveryService.name)
  private readonly providers: OtpProvider[]

  constructor(
    private readonly configService: ConfigService,
    private readonly autocallOtpProvider: AutocallOtpProvider
  ) {
    this.providers = [this.autocallOtpProvider]
  }

  async send({
    phoneNumber,
    code,
  }: {
    phoneNumber: string
    code: string
  }): Promise<void> {
    const deliveryId = randomUUID()
    let configuredProviders = 0
    this.logger.log({ event: 'otp.delivery.started', deliveryId, phoneNumber })

    for (const provider of this.providers) {
      if (!provider.isConfigured) {
        this.logger.warn({
          event: 'otp.provider.skipped',
          deliveryId,
          provider: provider.name,
          cause: 'not_configured',
        })
        continue
      }

      configuredProviders += 1
      try {
        await provider.send({ phoneNumber, code, deliveryId })
        return
      } catch {
        this.logger.warn({
          event: 'otp.provider.failed',
          deliveryId,
          provider: provider.name,
        })
      }
    }

    this.logger.warn({
      event: 'otp.fallback.started',
      deliveryId,
      cause:
        configuredProviders === 0
          ? 'no_configured_providers'
          : 'providers_failed',
    })

    const telegramFallbackSent = await this.sendTelegramFallback({
      phoneNumber,
      code,
      deliveryId,
    })

    this.logger.log({
      event: 'otp.fallback.completed',
      deliveryId,
      sent: telegramFallbackSent,
    })

    if (telegramFallbackSent) {
      return
    }

    throw new BadGatewayException('Failed to send OTP')
  }

  private async sendTelegramFallback({
    phoneNumber,
    code,
    deliveryId,
  }: {
    phoneNumber: string
    code: string
    deliveryId: string
  }): Promise<boolean> {
    const botToken = this.configService.get('otp.telegramFallback.botToken')
    const rawChatIds = this.configService.get('otp.telegramFallback.chatIds')
    const envName = this.configService.get('env.name')

    if (typeof botToken !== 'string' || typeof rawChatIds !== 'string') {
      this.logger.warn({
        event: 'otp.fallback.unavailable',
        deliveryId,
        cause: 'not_configured',
      })
      return false
    }

    const chatIds = rawChatIds
      .split(',')
      .map((chatId) => chatId.trim())
      .filter((chatId) => chatId.length > 0)

    if (chatIds.length === 0) {
      this.logger.warn({
        event: 'otp.fallback.unavailable',
        deliveryId,
        cause: 'not_configured',
      })
      return false
    }

    const deliveryResults = await Promise.all(
      chatIds.map(async (chatId) => {
        try {
          const response = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: chatId,
                text: `L7 Cargo OTP fallback\nEnv: ${envName ?? 'unknown'}\nPhone: ${phoneNumber}\nCode: ${code}`,
              }),
            }
          )

          const responseJson = (await response.json()) as {
            error_code?: number
            ok?: boolean
          }

          if (!response.ok || responseJson.ok !== true) {
            this.logger.error({
              event: 'otp.fallback.chat_failed',
              deliveryId,
              chatId,
              httpStatus: response.status,
              errorCode:
                typeof responseJson.error_code === 'number'
                  ? responseJson.error_code
                  : null,
            })
            return false
          }

          return true
        } catch {
          this.logger.error({
            event: 'otp.fallback.chat_failed',
            deliveryId,
            chatId,
            cause: 'request_failed',
          })
          return false
        }
      })
    )

    return deliveryResults.some((sent) => sent)
  }
}
