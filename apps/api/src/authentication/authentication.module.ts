import { Module } from '@nestjs/common'

import { DbModule } from '../db/db.module'
import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { OtpDeliveryModule } from './otp/otp-delivery.module'

@Module({
  imports: [DbModule, OtpDeliveryModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
