import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { ClientsService } from '../../clients/clients.service'
import { ALLOW_UNRESOLVED_CLIENT_KEY } from '../../clients/decorators/allow-unresolved-client.decorator'
import { ContextService } from '../../context/context.service'

@Injectable()
export class ClientAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly contextService: ContextService,
    private readonly clientsService: ClientsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (
      this.reflector.getAllAndOverride<boolean>(ALLOW_UNRESOLVED_CLIENT_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    ) {
      return true
    }

    const user = this.contextService.getUserOrThrow()
    if (user.role === 'admin') return true

    const client = await this.clientsService.findOneOrThrow({
      where: { id: user.clientId },
    })
    if (client.code < 0) {
      throw new ForbiddenException('CLIENT_CODE_UNRESOLVED')
    }
    return true
  }
}
