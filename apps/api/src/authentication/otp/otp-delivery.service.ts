import { Injectable, Logger } from '@nestjs/common'

import { AutocallOtpProvider } from './providers/autocall-otp.provider'
import { OtpProvider } from './providers/otp.provider'

@Injectable()
export class OtpDeliveryService {
  private readonly logger = new Logger(OtpDeliveryService.name)
  private readonly providers: OtpProvider[]

  constructor(private readonly autocallOtpProvider: AutocallOtpProvider) {
    this.providers = [this.autocallOtpProvider]
  }

  async send({
    phoneNumber,
    code,
    reason,
  }: {
    phoneNumber: string
    code: string
    reason: string
  }): Promise<void> {
    this.logger.log(`OTP for $${phoneNumber}: ${code}. Reason: ${reason}`)

    for (const provider of this.providers) {
      if (!provider.isConfigured) {
        continue
      }

      await provider.send({ phoneNumber, code })
    }
  }
}
