import { Module } from '@nestjs/common'

import { ConfigModule } from '../../config/config.module'
import { OtpDeliveryService } from './otp-delivery.service'
import { MobizonOtpProvider } from './providers/mobizon-otp.provider'
import { SmscOtpProvider } from './providers/smsc-otp.provider'

@Module({
  imports: [ConfigModule],
  providers: [OtpDeliveryService, MobizonOtpProvider, SmscOtpProvider],
  exports: [OtpDeliveryService],
})
export class OtpDeliveryModule {}
