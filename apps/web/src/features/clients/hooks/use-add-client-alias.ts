import { useMutation } from '@tanstack/react-query'

import {
  addClientAlias,
  type AddClientAliasRequestDto,
} from '../../../lib/api/api.gen'

export function useAddClientAlias(clientId: string) {
  return useMutation({
    mutationFn: (dto: AddClientAliasRequestDto) =>
      addClientAlias(clientId, dto),
  })
}
