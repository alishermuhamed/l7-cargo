import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsInt, IsOptional, Min } from 'class-validator'

export class PaginationParamsDto {
  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    description: 'Maximum number of items to return',
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  limit?: number

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    description:
      'Number of items to skip before starting to collect the result set',
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  offset?: number
}
