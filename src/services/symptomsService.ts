import type { Symptom } from '@/types/opd'
import { axiosInstance, responseData } from './axiosInstance'

export const symptomsService = {
  list: async () => responseData<Symptom[]>(await axiosInstance.get('/symptoms')),
}
