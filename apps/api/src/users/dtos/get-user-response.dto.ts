import { ApiProperty } from '@nestjs/swagger'

import type { UserRole } from '../user-role'
import { USER_ROLES } from '../user-role'

export class GetUserResponseDto {
  id!: string
  clientId!: number
  name!: string
  phoneNumber!: string | null

  @ApiProperty({ enum: USER_ROLES, enumName: 'UserRole' })
  role!: UserRole
}
