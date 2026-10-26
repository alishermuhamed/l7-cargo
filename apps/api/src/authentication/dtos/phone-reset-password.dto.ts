import { IsPhoneNumber, IsString, Length } from 'class-validator'

export class PhoneResetPasswordDto {
  @IsString()
  @Length(6)
  otp!: string

  @IsPhoneNumber()
  phoneNumber!: string

  @IsString()
  @Length(8, 128)
  newPassword!: string
}
