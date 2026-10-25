import { Module } from '@nestjs/common'

import { ClientsModule } from '../clients/clients.module'
import { DbModule } from '../db/db.module'
import { AccountsRepository } from './accounts.repository'
import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { OtpDeliveryModule } from './otp/otp-delivery.module'
import { RegistrationNotificationService } from './registration-notification.service'

@Module({
  imports: [DbModule, ClientsModule, OtpDeliveryModule],
  controllers: [AuthenticationController],
  providers: [
    AccountsRepository,
    AuthenticationService,
    RegistrationNotificationService,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
