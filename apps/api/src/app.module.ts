import { Module, ValidationPipe } from '@nestjs/common'
import { APP_GUARD, APP_PIPE } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { AppController } from './app.controller'
import { AuthenticationModule } from './authentication/authentication.module'
import { AuthorizationModule } from './authorization/authorization.module'
import { ClientMergesModule } from './client-merges/client-merges.module'
import { ClientsModule } from './clients/clients.module'
import { AuthenticationGuard } from './common/guards/authentication.guard'
import { ClientAccessGuard } from './common/guards/client-access.guard'
import { ConfigModule } from './config/config.module'
import { ContextModule } from './context/context.module'
import { DbModule } from './db/db.module'
import { ParcelsModule } from './parcels/parcels.module'
import { ParcelsImportsModule } from './parcels-imports/parcels-imports.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    DbModule,
    ContextModule,
    AuthenticationModule,
    AuthorizationModule,
    ClientsModule,
    ClientMergesModule,
    UsersModule,
    ParcelsModule,
    ParcelsImportsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ClientAccessGuard,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(),
    },
  ],
})
export class AppModule {}
