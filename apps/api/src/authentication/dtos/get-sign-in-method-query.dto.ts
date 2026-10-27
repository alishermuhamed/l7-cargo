import { IsE164PhoneNumber } from '../../common/validators/is-e164-phone-number'

export class GetSignInMethodQueryDto {
  @IsE164PhoneNumber()
  phoneNumber!: string
}
