import { ApiProperty } from '@nestjs/swagger'

import { SIGN_IN_METHODS, type SignInMethod } from '../authentication.types'

export class GetSignInMethodResponseDto {
  @ApiProperty({
    enum: SIGN_IN_METHODS,
    enumName: 'SignInMethod',
  })
  method!: SignInMethod
}
