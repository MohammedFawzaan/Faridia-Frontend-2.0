import axios from 'axios'
import type { ApiFailure, FieldErrors } from '@/types/api'

export type ApiErrorKind = 'network' | 'timeout' | 'unauthorized' | 'forbidden' | 'validation' | 'server' | 'unknown'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly statusCode: number | null
  readonly code: string | null
  readonly fieldErrors: FieldErrors

  constructor(kind: ApiErrorKind, message: string, statusCode: number | null = null, code: string | null = null, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.statusCode = statusCode
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

const kindFor = (statusCode: number): ApiErrorKind => {
  if (statusCode === 401) return 'unauthorized'
  if (statusCode === 403) return 'forbidden'
  if (statusCode === 400 || statusCode === 422) return 'validation'
  return statusCode >= 500 ? 'server' : 'unknown'
}

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error
  if (axios.isAxiosError<ApiFailure>(error)) {
    if (error.code === 'ECONNABORTED') {
      return new ApiError('timeout', 'The server is taking too long to respond. Please try again.')
    }
    if (!error.response) {
      return new ApiError('network', 'Cannot reach the server. Check your connection and try again.')
    }
    const { status, data } = error.response
    const fieldErrors: FieldErrors = {}
    for (const item of data?.errors ?? []) {
      fieldErrors[item.field] = item.messages[0]
    }
    return new ApiError(kindFor(status), data?.message ?? 'Something went wrong. Please try again.', status, data?.code ?? null, fieldErrors)
  }
  return new ApiError('unknown', 'Something went wrong. Please try again.')
}
