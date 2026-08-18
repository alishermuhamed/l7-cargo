import { IsPhoneNumber } from 'class-validator'

export class GetSignInMethodQueryDto {
  @IsPhoneNumber()
  phoneNumber!: string
}
