import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common'

import { SuccessResponseDto } from '../common/dtos/success-response.dto'
import { ContextService } from '../context/context.service'
import { ClientMergesService } from './client-merges.service'
import {
  ClientMergePreviewResponseDto,
  FindMergeCandidateQueryDto,
  MergeCandidateResponseDto,
  MergeClientsRequestDto,
  PreviewClientMergeQueryDto,
} from './dtos/client-merge.dto'

@Controller('clients/:clientId/merge')
export class ClientMergesController {
  constructor(
    private readonly service: ClientMergesService,
    private readonly context: ContextService
  ) {}

  private checkAdmin(): void {
    if (this.context.getUserOrThrow().role !== 'admin')
      throw new ForbiddenException()
  }

  @Get('candidates')
  async findMergeCandidates(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query() query: FindMergeCandidateQueryDto
  ): Promise<MergeCandidateResponseDto[]> {
    this.checkAdmin()
    return this.service.findCandidates(clientId, query.code)
  }

  @Get('preview')
  async previewClientMerge(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query() query: PreviewClientMergeQueryDto
  ): Promise<ClientMergePreviewResponseDto> {
    this.checkAdmin()
    return this.service.preview(clientId, query.sourceId)
  }

  @Post()
  async mergeClients(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() body: MergeClientsRequestDto
  ): Promise<SuccessResponseDto> {
    this.checkAdmin()
    await this.service.merge(clientId, body.sourceId, body.version, {
      actorId: this.context.getUserOrThrow().id,
      retainedUserId: body.retainedUserId,
      confirmedSamePerson: body.confirmedSamePerson,
    })
    return new SuccessResponseDto()
  }
}
