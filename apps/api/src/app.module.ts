import { Module, ValidationPipe } from '@nestjs/common'
import { APP_GUARD, APP_PIPE } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { AppController } from './app.controller'
import { AuthenticationModule } from './authentication/authentication.module'
import { AuthorizationModule } from './authorization/authorization.module'
import { AuthenticationGuard } from './common/guards/authentication.guard'
import { ConfigModule } from './config/config.module'
import { ContextModule } from './context/context.module'
import { DbModule } from './db/db.module'
import { ParcelsModule } from './parcels/parcels.module'
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
    UsersModule,
    ParcelsModule,
    AuthorizationModule,
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
      provide: APP_PIPE,
      useValue: new ValidationPipe(),
    },
  ],
})
export class AppModule {}
