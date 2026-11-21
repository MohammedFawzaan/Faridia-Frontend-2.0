import type { CreateUserPayload, StaffUser, UpdateUserPayload, UserListQuery } from '@/types/user'
import { axiosInstance, responseData, responsePage } from './axiosInstance'

export const usersService = {
  list: async (query: UserListQuery) => responsePage<StaffUser>(await axiosInstance.get('/users', { params: query })),
  create: async (payload: CreateUserPayload) => responseData<StaffUser>(await axiosInstance.post('/users', payload)),
  update: async (id: number, payload: UpdateUserPayload) => responseData<StaffUser>(await axiosInstance.patch(`/users/${id}`, payload)),
  setStatus: async (id: number, isActive: boolean) => responseData<StaffUser>(await axiosInstance.patch(`/users/${id}/status`, { isActive })),
  resetPassword: async (id: number) => responseData<StaffUser>(await axiosInstance.post(`/users/${id}/reset-password`)),
}
