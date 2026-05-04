import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'

import { AuthenticationService } from '../../authentication/authentication.service'
import { IS_PUBLIC_KEY } from '../../authentication/decorators/public.decorator'
import { AbilityFactory } from '../../authorization/ability.factory'
import { ContextService } from '../../context/context.service'
import { UsersService } from '../../users/users.service'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
    private readonly contextService: ContextService,
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService,
    private readonly abilityFactory: AbilityFactory
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()

    const session = await this.authenticationService.getSessionFromHeaders(
      request.headers
    )

    if (!session) {
      throw new UnauthorizedException()
    }

    const user = await this.usersService.findOneOrThrow({
      where: { id: session.user.id },
    })

    this.contextService.setUser(user)

    const ability = this.abilityFactory.createForUser(user)
    this.contextService.setAbility(ability)

    return true
  }
}
