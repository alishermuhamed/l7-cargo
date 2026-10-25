import { Type } from 'class-transformer'
import { IsInt, IsUUID, Matches, Max, Min, NotEquals } from 'class-validator'

import { INT32_MAX, INT32_MIN } from '../../common/integer.constants'

export class FindMergeCandidateQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(INT32_MIN)
  @Max(INT32_MAX)
  @NotEquals(0)
  declare code: number
}

export class PreviewClientMergeQueryDto {
  @IsUUID()
  declare sourceId: string
}

export class MergeClientsRequestDto extends PreviewClientMergeQueryDto {
  @Matches(/^[a-f0-9]{64}$/)
  declare version: string
}

export class MergeCandidateResponseDto {
  declare id: string
  declare code: number
  declare aliases: number[]
  declare name: string | null
  declare phone: string | null
  declare parcelCount: number
}

export class ClientMergePreviewResponseDto {
  declare name: string | null
  declare phone: string | null
  declare code: number
  declare aliases: number[]
  declare parcelCount: number
  declare version: string
}
