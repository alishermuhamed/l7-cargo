import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { createHash } from 'crypto'

import { ClientsService } from '../clients/clients.service'
import { ContextService } from '../context/context.service'
import { ParcelsService } from '../parcels/parcels.service'
import { UsersService } from '../users/users.service'

type MergeCandidate = {
  id: string
  code: number
  aliases: number[]
  name: string | null
  phone: string | null
  parcelCount: number
}

type MergePreview = {
  name: string | null
  phone: string | null
  code: number
  aliases: number[]
  parcelCount: number
  version: string
}

@Injectable()
export class ClientMergesService {
  private readonly logger = new Logger(ClientMergesService.name)

  constructor(
    private readonly clients: ClientsService,
    private readonly parcels: ParcelsService,
    private readonly users: UsersService,
    private readonly context: ContextService
  ) {}

  async findCandidates(
    targetId: string,
    code: number
  ): Promise<MergeCandidate[]> {
    const found = await this.clients.findOneByClientCode(code)
    if (!found || found.id === targetId) return []
    const client = await this.clients.findOneWithUserByIdOrThrow(found.id)
    const aliases = await this.clients.findAliasesByClientIds([client.id])
    return [
      {
        id: client.id,
        code: client.code,
        aliases: aliases.get(client.id) ?? [],
        name: client.user?.name ?? null,
        phone:
          client.user?.phoneNumber ??
          client.legacyPhoneNormalized ??
          client.legacyPhoneRaw,
        parcelCount: await this.parcels.countByClient(client.id),
      },
    ]
  }

  @Transactional()
  async preview(targetId: string, sourceId: string): Promise<MergePreview> {
    if (targetId === sourceId)
      throw new BadRequestException('CLIENT_MERGE_SAME_CLIENT')
    await this.clients.lockForMerge([targetId, sourceId])
    const target = await this.clients.findOneWithUserByIdOrThrow(targetId)
    const source = await this.clients.findOneWithUserByIdOrThrow(sourceId)
    if (target.user && source.user) {
      throw new ConflictException('CLIENT_MERGE_REVIEW_REQUIRED')
    }
    const aliases = await this.clients.findAliasesByClientIds([
      targetId,
      sourceId,
    ])
    await this.parcels.lockForClientMerge([targetId, sourceId])
    const targetCount = await this.parcels.countByClient(targetId)
    const sourceCount = await this.parcels.countByClient(sourceId)
    const codes = [
      ...new Set([
        ...(aliases.get(targetId) ?? []),
        source.code,
        ...(aliases.get(sourceId) ?? []),
      ]),
    ]
      .filter((code) => code > 0 && code !== target.code)
      .sort((a, b) => a - b)
    const version = createHash('sha256')
      .update(
        JSON.stringify({
          target,
          source,
          targetAliases: aliases.get(targetId) ?? [],
          sourceAliases: aliases.get(sourceId) ?? [],
          targetCount,
          sourceCount,
        })
      )
      .digest('hex')
    const user = target.user ?? source.user
    return {
      name: user?.name ?? null,
      phone:
        user?.phoneNumber ??
        target.legacyPhoneNormalized ??
        target.legacyPhoneRaw,
      code: target.code,
      aliases: codes,
      parcelCount: targetCount + sourceCount,
      version,
    }
  }

  @Transactional()
  async merge(
    targetId: string,
    sourceId: string,
    version: string
  ): Promise<void> {
    const preview = await this.preview(targetId, sourceId)
    if (preview.version !== version)
      throw new ConflictException('CLIENT_MERGE_CHANGED')
    const target = await this.clients.findOneByIdOrThrow(targetId)
    const source = await this.clients.findOneByIdOrThrow(sourceId)
    await this.users.transferClient(sourceId, targetId)
    await this.parcels.transferClient(sourceId, targetId)
    await this.clients.absorbClient(target, source)
    this.logger.log({
      action: 'client_merge',
      actorId: this.context.getUserOrThrow().id,
      targetId,
      sourceId,
      code: preview.code,
      aliases: preview.aliases,
      parcelCount: preview.parcelCount,
      version: preview.version,
    })
  }
}
