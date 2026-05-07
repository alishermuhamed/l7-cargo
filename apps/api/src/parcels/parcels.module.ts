import { Module } from '@nestjs/common'

import { ParcelsController } from './parcels.controller'
import { ParcelsPolicy } from './parcels.policy'
import { ParcelsRepository } from './parcels.repository'
import { ParcelsService } from './parcels.service'

@Module({
  controllers: [ParcelsController],
  providers: [ParcelsRepository, ParcelsService, ParcelsPolicy],
  exports: [ParcelsService],
})
export class ParcelsModule {}
