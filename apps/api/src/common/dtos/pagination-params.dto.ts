import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsInt, IsOptional, Min } from 'class-validator'

const DEFAULT_LIMIT = 10
const DEFAULT_OFFSET = 0

export class PaginationParamsDto {
  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    default: DEFAULT_LIMIT,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  limit: number = DEFAULT_LIMIT

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    default: DEFAULT_OFFSET,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  offset: number = DEFAULT_OFFSET
}
