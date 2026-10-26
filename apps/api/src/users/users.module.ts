import { Module } from '@nestjs/common'

import { AuthenticationModule } from '../authentication/authentication.module'
import { UsersController } from './users.controller'
import { UsersPolicy } from './users.policy'
import { UsersRepository } from './users.repository'
import { UsersService } from './users.service'

@Module({
  imports: [AuthenticationModule],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService, UsersPolicy],
  exports: [UsersService],
})
export class UsersModule {}
