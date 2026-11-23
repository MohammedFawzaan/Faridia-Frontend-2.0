import { z } from 'zod'

export const visitSchema = z.object({
  departmentId: z.string().min(1, 'Choose a department'),
  doctorId: z.string().min(1, 'Choose a doctor'),
  paymentMethodId: z.string().min(1, 'Choose a payment method'),
  symptoms: z.string().trim().max(1000, 'Symptoms must be at most 1000 characters'),
})

export type VisitValues = z.infer<typeof visitSchema>
