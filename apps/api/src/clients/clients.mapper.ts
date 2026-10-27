import { WithRelations } from '../db/db.types'
import { GetClientResponseDto } from './dtos/get-client-response.dto'
import { Client } from './entities/client.entity'

export class ClientsMapper {
  static toGetClientResponseDto(
    client: WithRelations<Client, { user: true; codeAliases: true }>
  ): GetClientResponseDto {
    return {
      id: client.id,
      code: client.code,
      aliases: client.codeAliases
        .map((alias) => alias.code)
        .sort((first, second) => first - second),
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
