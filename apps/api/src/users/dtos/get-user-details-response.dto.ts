import { GetUserResponseDto } from './get-user-response.dto'

export class GetUserDetailsResponseDto extends GetUserResponseDto {
  declare hasPassword: boolean
}
