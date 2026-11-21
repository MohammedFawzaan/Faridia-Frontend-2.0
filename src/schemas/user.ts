import { z } from 'zod'
import type { UserRole } from '@/types/auth'
import { ROLE_LABELS } from '@/utils/roles'

const roles = Object.keys(ROLE_LABELS) as [UserRole, ...UserRole[]]

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  mobile: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  auth: z.string().regex(/^[A-Za-z0-9_-]{3,10}$/, 'Login id must be 3 to 10 letters, digits, _ or -'),
  role: z.enum(roles, { error: 'Choose a role' }),
})

export const editUserSchema = createUserSchema.omit({ auth: true })

export type CreateUserValues = z.infer<typeof createUserSchema>
export type EditUserValues = z.infer<typeof editUserSchema>
