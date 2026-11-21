import { z } from 'zod'

const today = () => new Date().toISOString().slice(0, 10)

export const patientSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  fatherName: z.string().trim().min(2, "Father's name must be at least 2 characters").max(100, "Father's name must be at most 100 characters"),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter the date of birth')
    .refine((value) => value <= today(), 'Date of birth cannot be in the future'),
  gender: z.enum(['male', 'female', 'other'], { error: 'Choose a gender' }),
  address: z.string().trim().min(3, 'Address must be at least 3 characters').max(500, 'Address must be at most 500 characters'),
  city: z.string().trim().min(2, 'City must be at least 2 characters').max(40, 'City must be at most 40 characters'),
  pinCode: z.string().regex(/^\d{6}$/, 'Pin code must be exactly 6 digits'),
  mobile: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  isWhatsapp: z.boolean(),
  whatsappNumber: z.string().regex(/^(\d{10,15})?$/, 'WhatsApp number must be 10 to 15 digits'),
  lgNumber: z.string().trim().max(15, 'LG number must be at most 15 characters'),
  isFree: z.boolean(),
})

export const mobileSchema = z.object({
  mobile: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
})

export type PatientValues = z.infer<typeof patientSchema>
