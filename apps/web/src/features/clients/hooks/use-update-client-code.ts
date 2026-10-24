import { useMutation } from '@tanstack/react-query'

import {
  updateClientCode,
  type UpdateClientCodeRequestDto,
} from '../../../lib/api/api.gen'

export function useUpdateClientCode(clientId: string) {
  return useMutation({
    mutationFn: (dto: UpdateClientCodeRequestDto) =>
      updateClientCode(clientId, dto),
  })
}
