import { Module } from '@nestjs/common'

import { ClientCodeAliasRepository } from './client-code-alias.repository'
import { ClientsController } from './clients.controller'
import { ClientsPolicy } from './clients.policy'
import { ClientsRepository } from './clients.repository'
import { ClientsService } from './clients.service'

@Module({
  controllers: [ClientsController],
  providers: [
    ClientsRepository,
    ClientCodeAliasRepository,
    ClientsService,
    ClientsPolicy,
  ],
  exports: [ClientsService],
})
export class ClientsModule {}
