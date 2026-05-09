import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString } from 'class-validator'

import { PaginationParamsDto } from '../../common/dtos/pagination-params.dto'
import { USER_ROLES, type UserRole } from '../user-role'

export class GetUsersQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: USER_ROLES, enumName: 'UserRole' })
  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole
}
