import { GetClientResponseDto } from './dtos/get-client-response.dto'
import { Client } from './entities/client.entity'

export class ClientsMapper {
  static toGetClientResponseDto(
    client: Client & { user: Client['user'] | null },
    legacyCodes: number[]
  ): GetClientResponseDto {
    return {
      id: client.id,
      code: client.code,
      legacyCodes,
      legacyPhoneRaw: client.legacyPhoneRaw,
      legacyPhoneNormalized: client.legacyPhoneNormalized,
      user: client.user
        ? {
            id: client.user.id,
            name: client.user.name,
            phoneNumber: client.user.phoneNumber,
          }
        : null,
    }
  }
}
