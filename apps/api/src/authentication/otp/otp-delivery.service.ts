import { BadGatewayException, Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../config/config.service'
import { MobizonOtpProvider } from './providers/mobizon-otp.provider'
import { OtpProvider } from './providers/otp.provider'
import { SmscOtpProvider } from './providers/smsc-otp.provider'

@Injectable()
export class OtpDeliveryService {
  private readonly logger = new Logger(OtpDeliveryService.name)
  private readonly providers: OtpProvider[]

  constructor(
    private readonly configService: ConfigService,
    private readonly mobizonOtpProvider: MobizonOtpProvider,
    private readonly smscOtpProvider: SmscOtpProvider
  ) {
    this.providers = [this.mobizonOtpProvider, this.smscOtpProvider]
  }

  async send({
    phoneNumber,
    code,
  }: {
    phoneNumber: string
    code: string
  }): Promise<void> {
    let lastError: unknown

    for (const provider of this.providers) {
      if (!provider.isConfigured) {
        continue
      }

      try {
        await provider.send({ phoneNumber, code })
        return
      } catch (error: unknown) {
        lastError = error

        this.logger.warn(
          `OTP delivery failed via ${provider.name} for ${phoneNumber}`,
          error instanceof Error
            ? (error.stack ?? error.message)
            : String(error)
        )
      }
    }

    this.logger.error(
      `Unable to deliver OTP to ${phoneNumber} using configured providers`,
      lastError instanceof Error
        ? (lastError.stack ?? lastError.message)
        : String(lastError)
    )

    const telegramFallbackSent = await this.sendTelegramFallback({
      phoneNumber,
      code,
    })

    if (telegramFallbackSent) {
      return
    }

    throw new BadGatewayException('Failed to send OTP')
  }

  private async sendTelegramFallback({
    phoneNumber,
    code,
  }: {
    phoneNumber: string
    code: string
  }): Promise<boolean> {
    const botToken = this.configService.get('otp.telegramFallback.botToken')
    const rawChatIds = this.configService.get('otp.telegramFallback.chatIds')
    const envName = this.configService.get('env.name')

    if (typeof botToken !== 'string' || typeof rawChatIds !== 'string') {
      this.logger.warn('Telegram OTP fallback is not configured')
      return false
    }

    const chatIds = rawChatIds
      .split(',')
      .map((chatId) => chatId.trim())
      .filter((chatId) => chatId.length > 0)

    if (chatIds.length === 0) {
      this.logger.warn('Telegram OTP fallback is not configured')
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
            description?: string
            ok?: boolean
          }

          if (!response.ok || responseJson.ok !== true) {
            this.logger.error(
              `Telegram OTP fallback failed for ${phoneNumber} in chat ${chatId}: ${JSON.stringify(responseJson)}`
            )
            return false
          }

          return true
        } catch (error: unknown) {
          this.logger.error(
            `Telegram OTP fallback request failed for ${phoneNumber} in chat ${chatId}`,
            error instanceof Error
              ? (error.stack ?? error.message)
              : String(error)
          )
          return false
        }
      })
    )

    return deliveryResults.some((sent) => sent)
  }
}
