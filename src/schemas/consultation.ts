import { z } from 'zod'

const MEDICINE_OTHER = 'other'

const medicineLineSchema = z
  .object({
    medicineId: z.string(),
    name: z.string().trim().max(255, 'Medicine name must be at most 255 characters'),
    qty: z.coerce
      .number({ error: 'Enter the quantity' })
      .int('Quantity must be a whole number')
      .min(1, 'Quantity must be at least 1')
      .max(999, 'Quantity must be at most 999'),
  })
  .superRefine((line, context) => {
    if (!line.medicineId)
      context.addIssue({ code: 'custom', message: 'Choose a medicine or pick Other', path: ['medicineId'] })
    if (line.medicineId === MEDICINE_OTHER && line.name.length < 2)
      context.addIssue({ code: 'custom', message: 'Type the medicine name', path: ['name'] })
  })

export const consultationSchema = z
  .object({
    symptoms: z.array(z.string()),
    remarks: z.string().trim().max(1000, 'Remarks must be at most 1000 characters'),
    medicines: z.array(medicineLineSchema),
  })
  .refine((values) => values.symptoms.length > 0 || values.medicines.length > 0, {
    message: 'Add at least one symptom or medicine',
    path: ['form'],
  })

export type ConsultationValues = z.input<typeof consultationSchema>
export { MEDICINE_OTHER }
