import { Module } from '@nestjs/common'

import { ConfigModule } from '../../config/config.module'
import { OtpDeliveryService } from './otp-delivery.service'
import { AutocallOtpProvider } from './providers/autocall-otp.provider'

@Module({
  imports: [ConfigModule],
  providers: [OtpDeliveryService, AutocallOtpProvider],
  exports: [OtpDeliveryService],
})
export class OtpDeliveryModule {}
