import type { Prescription } from '@/types/opd'
import { axiosInstance, responseData } from './axiosInstance'

export const prescriptionsService = {
  get: async (id: string) => responseData<Prescription>(await axiosInstance.get(`/prescriptions/${id}`)),
}
