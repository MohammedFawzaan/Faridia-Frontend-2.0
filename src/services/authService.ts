import type { AuthSession, ChangePasswordPayload, LoginPayload, UserProfile } from '@/types/auth'
import { axiosInstance, responseData } from './axiosInstance'

export const authService = {
  login: async (payload: LoginPayload) => responseData<AuthSession>(await axiosInstance.post('/auth/login', payload)),
  me: async () => responseData<UserProfile>(await axiosInstance.get('/auth/me')),
  changePassword: async (payload: ChangePasswordPayload) => responseData<AuthSession>(await axiosInstance.post('/auth/change-password', payload)),
}
