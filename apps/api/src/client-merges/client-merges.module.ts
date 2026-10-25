import { Module } from '@nestjs/common'

import { ClientsModule } from '../clients/clients.module'
import { ParcelsModule } from '../parcels/parcels.module'
import { UsersModule } from '../users/users.module'
import { ClientMergesController } from './client-merges.controller'
import { ClientMergesService } from './client-merges.service'

@Module({
  imports: [ClientsModule, ParcelsModule, UsersModule],
  controllers: [ClientMergesController],
  providers: [ClientMergesService],
})
export class ClientMergesModule {}
