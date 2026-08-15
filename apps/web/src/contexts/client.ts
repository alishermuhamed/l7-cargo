import { createContext } from 'react'

import type { GetClientResponseDto } from '../lib/api/api.gen'

export const ClientContext = createContext<GetClientResponseDto | null>(null)
