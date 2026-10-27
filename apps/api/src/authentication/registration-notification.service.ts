import { Injectable, Logger } from '@nestjs/common'

import { ClientsService } from '../clients/clients.service'
import { ConfigService } from '../config/config.service'

@Injectable()
export class RegistrationNotificationService {
  private readonly logger = new Logger(RegistrationNotificationService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly clientsService: ClientsService
  ) {}

  async send(user: {
    id: string
    name: string
    phoneNumber?: unknown
  }): Promise<void> {
    const botToken = this.configService
      .get('registrationNotifications.botToken')
      ?.trim()
    const chatId = this.configService
      .get('registrationNotifications.chatId')
      ?.trim()

    if (!botToken || !chatId) {
      return
    }

    try {
      const client = await this.clientsService.findOneByUserIdOrThrow(user.id)
      const aliasesByClientId =
        await this.clientsService.findAliasesByClientIds([client.id])
      const aliases = aliasesByClientId.get(client.id) ?? []
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000),
          body: JSON.stringify({
            chat_id: chatId,
            text: [
              'Новая регистрация в L7 Cargo',
              `Окружение: ${this.configService.get('env.name') ?? 'unknown'}`,
              `Телефон: ${typeof user.phoneNumber === 'string' ? user.phoneNumber : 'не указан'}`,
              `Имя: ${user.name || 'не указано'}`,
              `Код клиента: ${client.code}`,
              ...(aliases.length > 0
                ? [`Альтернативные коды: ${aliases.join(', ')}`]
                : []),
              `ID: ${user.id}`,
            ].join('\n'),
          }),
        }
      )
      const result: unknown = await response.json()

      if (
        !response.ok ||
        typeof result !== 'object' ||
        result === null ||
        !('ok' in result) ||
        result.ok !== true
      ) {
        this.logger.error(
          `Telegram registration notification failed for user ${user.id} (HTTP ${response.status})`
        )
      }
    } catch {
      // Fetch errors can contain the bot token in the URL; do not log them.
      this.logger.error(
        `Telegram registration notification request failed for user ${user.id}`
      )
    }
  }
}
