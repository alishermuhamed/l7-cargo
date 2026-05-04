import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ConfigService } from '../config/config.service'
import { BetterAuthTypeOrmAdapter } from './adapters/better-auth-typeorm.adapter'
import { buildDataSourceOptions } from './data-source-options'
import { DbService } from './db.service'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildDataSourceOptions(config.getOrThrow('database')),
    }),
  ],
  providers: [DbService, BetterAuthTypeOrmAdapter],
  exports: [DbService, BetterAuthTypeOrmAdapter],
})
export class DbModule {}
