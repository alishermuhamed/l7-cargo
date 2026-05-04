import { IsPhoneNumber } from 'class-validator'

export class PhoneSendOtpDto {
  @IsPhoneNumber()
  phoneNumber!: string
}
