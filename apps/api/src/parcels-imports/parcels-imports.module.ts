import { Module } from '@nestjs/common'

import { ClientsModule } from '../clients/clients.module'
import { ParcelsModule } from '../parcels/parcels.module'
import { ParcelsImportsController } from './parcels-imports.controller'
import { ParcelsImportsPolicy } from './parcels-imports.policy'
import { ParcelsImportsRepository } from './parcels-imports.repository'
import { ParcelsImportsService } from './parcels-imports.service'

@Module({
  imports: [ClientsModule, ParcelsModule],
  controllers: [ParcelsImportsController],
  providers: [
    ParcelsImportsRepository,
    ParcelsImportsService,
    ParcelsImportsPolicy,
  ],
})
export class ParcelsImportsModule {}
