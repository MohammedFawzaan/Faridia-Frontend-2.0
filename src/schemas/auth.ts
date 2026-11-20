import { z } from 'zod'

export const loginSchema = z.object({
  mobile: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  password: z.string().min(1, 'Password is required').max(64, 'Password must be at most 64 characters'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(64, 'New password must be at most 64 characters')
      .regex(/[A-Za-z]/, 'New password must contain a letter')
      .regex(/\d/, 'New password must contain a number'),
    confirmPassword: z.string().min(1, 'Confirm the new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the current one',
  })

export type LoginValues = z.infer<typeof loginSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
