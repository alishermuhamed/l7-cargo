import { Module } from '@nestjs/common'

import { OtpDeliveryService } from './otp-delivery.service'
import { AutocallOtpProvider } from './providers/autocall-otp.provider'

@Module({
  providers: [OtpDeliveryService, AutocallOtpProvider],
  exports: [OtpDeliveryService],
})
export class OtpDeliveryModule {}
