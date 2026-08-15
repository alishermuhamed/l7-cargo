import { Module } from '@nestjs/common'

import { ClientsController } from './clients.controller'
import { ClientsPolicy } from './clients.policy'
import { ClientsRepository } from './clients.repository'
import { ClientsService } from './clients.service'

@Module({
  controllers: [ClientsController],
  providers: [ClientsRepository, ClientsService, ClientsPolicy],
  exports: [ClientsService],
})
export class ClientsModule {}
