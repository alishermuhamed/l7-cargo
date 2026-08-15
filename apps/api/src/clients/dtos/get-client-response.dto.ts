class LinkedUserDto {
  id!: string
  name!: string
  phoneNumber!: string | null
}

export class GetClientResponseDto {
  id!: string
  code!: number
  legacyPhoneRaw!: string | null
  legacyPhoneNormalized!: string | null
  user!: LinkedUserDto | null
}
