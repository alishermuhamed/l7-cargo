import { useMutation } from '@tanstack/react-query'

import { removeClientAlias } from '../../../lib/api/api.gen'

export function useRemoveAliasMutation(clientId: string) {
  return useMutation({
    mutationFn: (code: number) => removeClientAlias(clientId, code),
  })
}
