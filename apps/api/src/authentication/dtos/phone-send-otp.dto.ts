import { IsE164PhoneNumber } from '../../common/validators/is-e164-phone-number'

export class PhoneSendOtpDto {
  @IsE164PhoneNumber()
  phoneNumber!: string
}
