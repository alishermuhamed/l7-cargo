import { IsPhoneNumber, IsString, Length, MinLength } from 'class-validator'

export class PhoneResetPasswordDto {
  @IsString()
  @Length(6)
  otp!: string

  @IsPhoneNumber()
  phoneNumber!: string

  @IsString()
  @MinLength(8)
  newPassword!: string
}
