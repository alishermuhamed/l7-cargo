import { AbilityBuilder } from '@casl/ability'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { FindOptionsWhere } from 'typeorm'

import { Ability } from '../authorization/authorization.types'
import { EntityPolicyProvider } from '../authorization/decorators/entity-policy-provider.decorator'
import { EntityPolicy } from '../authorization/entity.policy'
import { ContextService } from '../context/context.service'
import { User } from '../users/entities/user.entity'
import { CreateParcelRequestDto } from './dtos/create-parcel-request.dto'
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

    can('create', Parcel, ['trackingNumber', 'source', 'description'])
    can('read', Parcel, { clientId: user.clientId })
    can('update', Parcel, ['source', 'description'], {
      clientId: user.clientId,
    })
    can('delete', Parcel, { clientId: user.clientId })
  }

  checkCanCreate(createParcelRequestDto: CreateParcelRequestDto): void {
    for (const field of Object.keys(createParcelRequestDto) as Array<
      keyof CreateParcelRequestDto
    >) {
      if (
        createParcelRequestDto[field] !== undefined &&
        !this.ability.can('create', Parcel, field)
      ) {
        throw new ForbiddenException()
      }
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

    for (const field of Object.keys(updateParcelRequestDto) as Array<
      keyof UpdateParcelRequestDto
    >) {
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

  checkCanManageStatusHistory(): void {
    const user = this.contextService.getUserOrThrow()

    if (user.role !== 'admin') {
      throw new ForbiddenException()
    }
  }

  getFindOptionsWhere(): FindOptionsWhere<Parcel> {
    const user = this.contextService.getUserOrThrow()

    if (user.role === 'admin') {
      return {}
    }

    return { clientId: user.clientId }
  }
}
