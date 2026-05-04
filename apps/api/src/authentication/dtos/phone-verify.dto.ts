import {
  IsBoolean,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator'

export class PhoneVerifyDto {
  @IsString()
  @Length(6)
  code!: string

  @IsPhoneNumber()
  phoneNumber!: string

  @IsOptional()
  @IsBoolean()
  disableSession?: boolean

  @IsOptional()
  @IsBoolean()
  updatePhoneNumber?: boolean
}
