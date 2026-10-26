import { GetSignInMethodResponseDto } from './dtos/get-sign-in-method-response.dto'
import type { SignInMethod } from './sign-in-method'

export class AuthenticationMapper {
  static toGetSignInMethodResponseDto(
    method: SignInMethod
  ): GetSignInMethodResponseDto {
    return { method }
  }
}
