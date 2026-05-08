import type { UserRole } from '../user-role'

export class GetUserResponseDto {
  id!: string
  name!: string
  phoneNumber!: string | null
  role!: UserRole
}
