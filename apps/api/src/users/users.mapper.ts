import { Client } from '../clients/entities/client.entity'
import { GetUserResponseDto } from './dtos/get-user-response.dto'
import { User } from './entities/user.entity'

export class UsersMapper {
  static toGetUserResponseDto(
    user: User & { client: Client }
  ): GetUserResponseDto {
    return {
      id: user.id,
      clientId: user.clientId,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      requiresCodeResolution: user.role !== 'admin' && user.client.code < 0,
    }
  }
}
