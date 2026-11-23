import type { SortOrder } from './api'
import type { UserRole } from './auth'

export interface StaffUser {
  id: number
  auth: string
  name: string
  mobile: string
  role: UserRole
  doctorId: number | null
  labDepartmentId: number | null
  isActive: boolean
  mustResetPassword: boolean
  createdAt: string
}

export type UserSortField = 'name' | 'role' | 'createdAt'

export interface UserListQuery {
  page: number
  limit: number
  search?: string
  role?: UserRole
  isActive?: boolean
  sortBy: UserSortField
  sortOrder: SortOrder
}

export interface CreateUserPayload {
  name: string
  mobile: string
  auth: string
  role: UserRole
  doctorId?: number | null
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'auth'>>
