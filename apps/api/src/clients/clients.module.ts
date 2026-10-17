import { Module } from '@nestjs/common'

import { ClientsController } from './clients.controller'
import { ClientsPolicy } from './clients.policy'
import { ClientsRepository } from './clients.repository'
import { ClientsService } from './clients.service'
import { LegacyClientCodeAliasRepository } from './legacy-client-code-alias.repository'

@Module({
  controllers: [ClientsController],
  providers: [
    ClientsRepository,
    LegacyClientCodeAliasRepository,
    ClientsService,
    ClientsPolicy,
  ],
  exports: [ClientsService],
})
export class ClientsModule {}
