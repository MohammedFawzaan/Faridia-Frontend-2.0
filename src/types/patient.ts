import type { SortOrder } from './api'

export type Gender = 'male' | 'female' | 'other'
export type AgeType = 'year' | 'month' | 'day'

export interface Patient {
  patientId: string
  name: string
  fatherName: string | null
  dob: string | null
  age: number
  ageType: AgeType
  gender: Gender
  address: string
  city: string | null
  pinCode: string | null
  mobile: string
  isWhatsapp: boolean
  whatsappNumber: string | null
  lgNumber: string | null
  isFree: boolean
  photoPath: string | null
  createdBy: string
  createdAt: string
}

export type PatientSortField = 'createdAt' | 'name' | 'patientId'

export interface PatientListQuery {
  page: number
  limit: number
  search?: string
  mobile?: string
  gender?: Gender
  isFree?: boolean
  sortBy: PatientSortField
  sortOrder: SortOrder
}

export interface PatientPayload {
  name: string
  fatherName: string
  dob: string
  gender: Gender
  address: string
  city: string
  pinCode: string
  mobile: string
  isWhatsapp: boolean
  whatsappNumber?: string | null
  lgNumber?: string | null
  isFree: boolean
}
