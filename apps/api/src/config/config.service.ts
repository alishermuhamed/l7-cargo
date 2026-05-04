import { Injectable } from '@nestjs/common'
import { ConfigService as NestConfigService, Path } from '@nestjs/config'

import { EnvConfig } from './env-config'

@Injectable()
export class ConfigService {
  constructor(
    private readonly configService: NestConfigService<EnvConfig, true>
  ) {}

  get<T extends Path<EnvConfig>>(key: T) {
    return this.configService.get(key, { infer: true })
  }

  getOrThrow<T extends Path<EnvConfig>>(key: T) {
    return this.configService.getOrThrow(key, { infer: true })
  }
}
