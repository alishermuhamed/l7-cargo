import { IsString, Length } from 'class-validator'

import { IsE164PhoneNumber } from '../../common/validators/is-e164-phone-number'

export class PhoneResetPasswordDto {
  @IsString()
  @Length(6)
  otp!: string

  @IsE164PhoneNumber()
  phoneNumber!: string

  @IsString()
  @Length(8, 128)
  newPassword!: string
}
