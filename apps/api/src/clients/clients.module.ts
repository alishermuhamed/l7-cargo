import { Module } from '@nestjs/common'

import { ClientCodeAliasesRepository } from './client-code-aliases.repository'
import { ClientsController } from './clients.controller'
import { ClientsPolicy } from './clients.policy'
import { ClientsRepository } from './clients.repository'
import { ClientsService } from './clients.service'

@Module({
  controllers: [ClientsController],
  providers: [
    ClientsRepository,
    ClientCodeAliasesRepository,
    ClientsService,
    ClientsPolicy,
  ],
  exports: [ClientsService],
})
export class ClientsModule {}
