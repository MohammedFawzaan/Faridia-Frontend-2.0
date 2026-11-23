import type { Bill } from '@/types/opd'
import { axiosInstance, responseData } from './axiosInstance'

export const billsService = {
  get: async (id: string) => responseData<Bill>(await axiosInstance.get(`/bills/${id}`)),
}
