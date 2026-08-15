import { IsOptional, IsString } from 'class-validator'

import { PaginationParamsDto } from '../../common/dtos/pagination-params.dto'

export class GetClientsQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsString()
  search?: string
}
