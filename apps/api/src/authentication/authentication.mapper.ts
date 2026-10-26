import type { SignInMethod } from './authentication.types'
import { GetSignInMethodResponseDto } from './dtos/get-sign-in-method-response.dto'

export class AuthenticationMapper {
  static toGetSignInMethodResponseDto(
    method: SignInMethod
  ): GetSignInMethodResponseDto {
    return { method }
  }
}
