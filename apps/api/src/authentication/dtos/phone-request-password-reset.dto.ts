import { IsPhoneNumber } from 'class-validator'

export class PhoneRequestPasswordResetDto {
  @IsPhoneNumber()
  phoneNumber!: string
}
