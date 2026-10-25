import { z } from 'zod'

import { ParcelStatus } from './api/api.gen'

export const listSearchSchema = z.object({
  search: z.string().optional().catch(undefined),
  page: z
    .number()
    .int()
    .min(1)
    .max(Number.MAX_SAFE_INTEGER)
    .optional()
    .catch(undefined),
})

export const parcelsSearchSchema = listSearchSchema.extend({
  status: z.enum(ParcelStatus).optional().catch(undefined),
})
