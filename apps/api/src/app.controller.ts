import { Controller, Get } from '@nestjs/common'

import { Public } from './authentication/decorators/public.decorator'
import { AllowUnresolvedClient } from './clients/decorators/allow-unresolved-client.decorator'

@Public()
@Controller()
export class AppController {
  @AllowUnresolvedClient()
  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' }
  }
}
