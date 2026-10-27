import { AbilityBuilder } from '@casl/ability'
import { ForbiddenException, Injectable } from '@nestjs/common'

import { Ability } from '../authorization/authorization.types'
import { EntityPolicyProvider } from '../authorization/decorators/entity-policy-provider.decorator'
import { EntityPolicy } from '../authorization/entity.policy'
import { ContextService } from '../context/context.service'
import { User } from '../users/entities/user.entity'
import { ClientsService } from './clients.service'
import { Client } from './entities/client.entity'

@EntityPolicyProvider()
@Injectable()
export class ClientsPolicy extends EntityPolicy<Client> {
  constructor(
    protected readonly contextService: ContextService,
    private readonly clientsService: ClientsService
  ) {
    super(contextService, Client)
  }

  defineRules(builder: AbilityBuilder<Ability>, user: User): void {
    const { can } = builder

    if (user.role === 'admin') {
      can(['read', 'update'], Client)
      return
    }

    can('read', Client, { id: user.clientId })
  }

  checkCanManageCodes(): void {
    this.checkIsAdmin()
  }

  checkCanList(): void {
    this.checkIsAdmin()
  }

  async checkCanRead(clientId: string): Promise<void> {
    const client = await this.clientsService.findOneByIdOrThrow(clientId)

    if (!this.ability.can('read', client)) {
      throw new ForbiddenException()
    }
  }
}
