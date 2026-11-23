import type { Medicine } from '@/types/opd'
import { axiosInstance, responseData } from './axiosInstance'

export const medicinesService = {
  list: async () => responseData<Medicine[]>(await axiosInstance.get('/medicines')),
}
