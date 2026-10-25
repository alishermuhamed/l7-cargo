import { ApiProperty } from '@nestjs/swagger'

import { SIGN_IN_METHODS, type SignInMethod } from '../sign-in-method'

export class GetSignInMethodResponseDto {
  @ApiProperty({
    enum: SIGN_IN_METHODS,
    enumName: 'SignInMethod',
  })
  method!: SignInMethod
}
