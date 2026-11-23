import { z } from 'zod'

export const doctorSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  graduation: z.string().trim().min(1, 'Enter the graduation').max(15, 'Graduation must be at most 15 characters'),
  postGraduation: z.string().trim().max(10, 'Post graduation must be at most 10 characters'),
  departmentId: z.string().min(1, 'Choose a department'),
  consultationFee: z
    .string()
    .trim()
    .min(1, 'Enter the consultation fee')
    .refine((value) => !Number.isNaN(Number(value)), 'Fee must be a number')
    .refine((value) => Number(value) >= 0, 'Fee cannot be negative')
    .refine((value) => Number(value) <= 100000, 'Fee is too high')
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), 'Fee can have at most 2 decimals'),
})

export type DoctorValues = z.infer<typeof doctorSchema>
