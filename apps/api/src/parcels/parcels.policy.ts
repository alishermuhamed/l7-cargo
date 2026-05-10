import { AbilityBuilder } from '@casl/ability'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { FindOptionsWhere } from 'typeorm'

import { Ability } from '../authorization/authorization.types'
import { EntityPolicyProvider } from '../authorization/decorators/entity-policy-provider.decorator'
import { EntityPolicy } from '../authorization/entity.policy'
import { ContextService } from '../context/context.service'
import { User } from '../users/entities/user.entity'
import { UpdateParcelRequestDto } from './dtos/update-parcel-request.dto'
import { Parcel } from './entities/parcel.entity'
import { ParcelsService } from './parcels.service'

@EntityPolicyProvider()
@Injectable()
export class ParcelsPolicy extends EntityPolicy<Parcel> {
  constructor(
    protected readonly contextService: ContextService,
    private readonly parcelsService: ParcelsService
  ) {
    super(contextService, Parcel)
  }

  defineRules(builder: AbilityBuilder<Ability>, user: User): void {
    const { can } = builder

    if (user.role === 'admin') {
      can(['create', 'read', 'update', 'delete'], Parcel)
      return
    }

    can('create', Parcel)
    can('read', Parcel, { userId: user.id })
    can('update', Parcel, ['source', 'description'], { userId: user.id })
    can('delete', Parcel, { userId: user.id })
  }

  checkCanCreate(): void {
    if (!this.ability.can('create', Parcel)) {
      throw new ForbiddenException()
    }
  }

  async checkCanRead(parcelId: string): Promise<void> {
    const parcel = await this.parcelsService.findOneOrThrow({
      where: { id: parcelId },
    })

    if (!this.ability.can('read', parcel)) {
      throw new ForbiddenException()
    }
  }

  async checkCanUpdate(
    parcelId: string,
    updateParcelRequestDto: UpdateParcelRequestDto
  ): Promise<void> {
    const parcel = await this.parcelsService.findOneOrThrow({
      where: { id: parcelId },
    })

    const updateFields: Array<keyof UpdateParcelRequestDto> = [
      'source',
      'description',
      'weightKg',
      'deliveryFee',
    ]

    for (const field of updateFields) {
      if (
        updateParcelRequestDto[field] !== undefined &&
        !this.ability.can('update', parcel, field)
      ) {
        throw new ForbiddenException()
      }
    }
  }

  async checkCanDelete(parcelId: string): Promise<void> {
    const parcel = await this.parcelsService.findOneOrThrow({
      where: { id: parcelId },
    })

    if (!this.ability.can('delete', parcel)) {
      throw new ForbiddenException()
    }
  }

  getFindOptionsWhere(): FindOptionsWhere<Parcel> {
    const user = this.contextService.getUserOrThrow()

    if (user.role === 'admin') {
      return {}
    }

    return { userId: user.id }
  }
}
