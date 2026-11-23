import type { SortOrder } from './api'
import type { Doctor } from './opd'

export interface DoctorAdmin extends Doctor {
  isActive: boolean
  createdAt: string
}

export type DoctorSortField = 'name' | 'consultationFee' | 'createdAt'

export interface DoctorListQuery {
  page: number
  limit: number
  search?: string
  departmentId?: number
  isActive?: boolean
  sortBy: DoctorSortField
  sortOrder: SortOrder
}

export interface DoctorPayload {
  name: string
  graduation: string
  postGraduation: string
  departmentId: number
  consultationFee: number
  isActive?: boolean
}
