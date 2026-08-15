import { Module } from '@nestjs/common'

import { ClientsModule } from '../clients/clients.module'
import { DbModule } from '../db/db.module'
import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { OtpDeliveryModule } from './otp/otp-delivery.module'

@Module({
  imports: [DbModule, ClientsModule, OtpDeliveryModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
