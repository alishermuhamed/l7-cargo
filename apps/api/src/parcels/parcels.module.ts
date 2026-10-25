import { Module } from '@nestjs/common'

import { ClientsModule } from '../clients/clients.module'
import { ParcelStatusHistoryRepository } from './parcel-status-history.repository'
import { ParcelStatusHistoryService } from './parcel-status-history.service'
import { ParcelsController } from './parcels.controller'
import { ParcelsPolicy } from './parcels.policy'
import { ParcelsRepository } from './parcels.repository'
import { ParcelsService } from './parcels.service'

@Module({
  imports: [ClientsModule],
  controllers: [ParcelsController],
  providers: [
    ParcelsRepository,
    ParcelStatusHistoryRepository,
    ParcelsService,
    ParcelStatusHistoryService,
    ParcelsPolicy,
  ],
  exports: [ParcelsService, ParcelStatusHistoryService],
})
export class ParcelsModule {}
