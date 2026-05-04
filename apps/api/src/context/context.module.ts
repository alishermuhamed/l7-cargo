import { Global, Module } from '@nestjs/common'
import { getDataSourceToken } from '@nestjs/typeorm'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm'
import { ClsModule } from 'nestjs-cls'

import { ContextService } from './context.service'

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
      plugins: [
        new ClsPluginTransactional({
          adapter: new TransactionalAdapterTypeOrm({
            dataSourceToken: getDataSourceToken(),
          }),
        }),
      ],
    }),
  ],
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule {}
