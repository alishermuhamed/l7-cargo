import { Module } from '@nestjs/common'

import { ClientsModule } from '../clients/clients.module'
import { DbModule } from '../db/db.module'
import { UsersModule } from '../users/users.module'
import { AccountsRepository } from './accounts.repository'
import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { OtpDeliveryModule } from './otp/otp-delivery.module'
import { PasswordsController } from './passwords.controller'
import { RegistrationNotificationService } from './registration-notification.service'
import { SessionsRepository } from './sessions.repository'

@Module({
  imports: [DbModule, ClientsModule, UsersModule, OtpDeliveryModule],
  controllers: [AuthenticationController, PasswordsController],
  providers: [
    AccountsRepository,
    SessionsRepository,
    AuthenticationService,
    RegistrationNotificationService,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
