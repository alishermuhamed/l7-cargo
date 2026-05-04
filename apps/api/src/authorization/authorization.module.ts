import { Module } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'

import { AbilityFactory } from './ability.factory'

@Module({
  imports: [DiscoveryModule],
  providers: [AbilityFactory],
  exports: [AbilityFactory],
})
export class AuthorizationModule {}
