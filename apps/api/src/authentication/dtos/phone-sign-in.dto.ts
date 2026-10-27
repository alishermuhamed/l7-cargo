import { IsBoolean, IsOptional, IsString } from 'class-validator'

import { IsE164PhoneNumber } from '../../common/validators/is-e164-phone-number'

export class PhoneSignInDto {
  @IsE164PhoneNumber()
  phoneNumber!: string

  @IsString()
  password!: string

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean
}
