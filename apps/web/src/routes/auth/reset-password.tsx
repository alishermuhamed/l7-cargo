import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { phoneNumberSchema } from '../../lib/phone-number-schema'

export const Route = createFileRoute('/auth/reset-password')({
  validateSearch: z.object({
    phoneNumber: phoneNumberSchema.optional().catch(undefined),
    redirectTo: z.string().optional(),
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: '/auth/forgot-password',
      search,
      replace: true,
    })
  },
})
