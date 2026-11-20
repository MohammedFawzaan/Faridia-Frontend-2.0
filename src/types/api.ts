export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiSuccess<T> {
  success: true
  message: string
  data: T
  meta?: PageMeta
}

export interface FieldError {
  field: string
  messages: string[]
}

export interface ApiFailure {
  success: false
  statusCode: number
  message: string
  code?: string
  errors?: FieldError[]
}

export type FieldErrors = Record<string, string>
