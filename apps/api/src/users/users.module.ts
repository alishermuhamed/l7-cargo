import { Module } from '@nestjs/common'

import { UsersController } from './users.controller'
import { UsersPolicy } from './users.policy'
import { UsersRepository } from './users.repository'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersController],
  providers: [UsersRepository, UsersService, UsersPolicy],
  exports: [UsersService],
})
export class UsersModule {}
