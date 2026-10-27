import { IsBoolean, IsOptional, IsString, Length } from 'class-validator'

import { IsE164PhoneNumber } from '../../common/validators/is-e164-phone-number'

export class PhoneVerifyDto {
  @IsString()
  @Length(6)
  code!: string

  @IsE164PhoneNumber()
  phoneNumber!: string

  @IsOptional()
  @IsBoolean()
  disableSession?: boolean

  @IsOptional()
  @IsBoolean()
  updatePhoneNumber?: boolean
}
