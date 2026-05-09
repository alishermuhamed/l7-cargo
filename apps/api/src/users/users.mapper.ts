import { GetUserResponseDto } from './dtos/get-user-response.dto'
import { User } from './entities/user.entity'

export class UsersMapper {
  static toGetUserResponseDto(user: User): GetUserResponseDto {
    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
    }
  }
}
