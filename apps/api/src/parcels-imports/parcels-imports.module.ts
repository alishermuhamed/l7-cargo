import { Module } from '@nestjs/common'

import { ParcelsModule } from '../parcels/parcels.module'
import { UsersModule } from '../users/users.module'
import { ParcelsImportsController } from './parcels-imports.controller'
import { ParcelsImportsPolicy } from './parcels-imports.policy'
import { ParcelsImportsRepository } from './parcels-imports.repository'
import { ParcelsImportsService } from './parcels-imports.service'

@Module({
  imports: [UsersModule, ParcelsModule],
  controllers: [ParcelsImportsController],
  providers: [
    ParcelsImportsRepository,
    ParcelsImportsService,
    ParcelsImportsPolicy,
  ],
})
export class ParcelsImportsModule {}
