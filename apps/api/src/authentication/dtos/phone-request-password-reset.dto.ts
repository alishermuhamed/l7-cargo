import { IsE164PhoneNumber } from '../../common/validators/is-e164-phone-number'

export class PhoneRequestPasswordResetDto {
  @IsE164PhoneNumber()
  phoneNumber!: string
}
