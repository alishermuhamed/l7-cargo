import { type CustomDecorator, SetMetadata } from '@nestjs/common'

export const ALLOW_UNRESOLVED_CLIENT_KEY = 'allowUnresolvedClient'

export const AllowUnresolvedClient = (): CustomDecorator<string> =>
  SetMetadata(ALLOW_UNRESOLVED_CLIENT_KEY, true)
