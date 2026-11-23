import type { Department } from '@/types/opd'
import { axiosInstance, responseData } from './axiosInstance'

export const departmentsService = {
  list: async (type?: Department['type']) =>
    responseData<Department[]>(await axiosInstance.get('/departments', { params: { type } })),
}
