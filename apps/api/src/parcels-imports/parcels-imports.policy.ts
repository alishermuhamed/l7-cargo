import { AbilityBuilder } from '@casl/ability'
import { ForbiddenException, Injectable } from '@nestjs/common'

import { Ability } from '../authorization/authorization.types'
import { EntityPolicyProvider } from '../authorization/decorators/entity-policy-provider.decorator'
import { EntityPolicy } from '../authorization/entity.policy'
import { ContextService } from '../context/context.service'
import { User } from '../users/entities/user.entity'
import { ParcelsImport } from './entities/parcels-import.entity'
import { ParcelsImportsService } from './parcels-imports.service'

@EntityPolicyProvider()
@Injectable()
export class ParcelsImportsPolicy extends EntityPolicy<ParcelsImport> {
  constructor(
    protected readonly contextService: ContextService,
    private readonly parcelsImportsService: ParcelsImportsService
  ) {
    super(contextService, ParcelsImport)
  }

  defineRules(builder: AbilityBuilder<Ability>, user: User): void {
    const { can } = builder

    if (user.role === 'admin') {
      can(['create', 'read', 'update', 'delete'], ParcelsImport)
      return
    }
  }

  checkCanCreate(): void {
    if (!this.ability.can('create', ParcelsImport)) {
      throw new ForbiddenException()
    }
  }

  async checkCanRead(parcelsImportId: string): Promise<void> {
    const parcelsImport = await this.parcelsImportsService.findOneOrThrow({
      where: { id: parcelsImportId },
    })

    if (!this.ability.can('read', parcelsImport)) {
      throw new ForbiddenException()
    }
  }

  async checkCanCommit(parcelsImportId: string): Promise<void> {
    const parcelsImport = await this.parcelsImportsService.findOneOrThrow({
      where: { id: parcelsImportId },
    })

    if (!this.ability.can('update', parcelsImport)) {
      throw new ForbiddenException()
    }
  }
}
