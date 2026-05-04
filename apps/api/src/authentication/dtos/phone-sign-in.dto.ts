import { IsBoolean, IsOptional, IsPhoneNumber, IsString } from 'class-validator'

export class PhoneSignInDto {
  @IsPhoneNumber()
  phoneNumber!: string

  @IsString()
  password!: string

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean
}
