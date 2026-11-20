import type { ZodType } from 'zod'
import type { FieldErrors } from '@/types/api'

export type ValidationResult<T> = { ok: true; values: T } | { ok: false; errors: FieldErrors }

export const validate = <T>(schema: ZodType<T>, input: unknown): ValidationResult<T> => {
  const result = schema.safeParse(input)
  if (result.success) return { ok: true, values: result.data }
  const errors: FieldErrors = {}
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? '')
    if (!(field in errors)) errors[field] = issue.message
  }
  return { ok: false, errors }
}
