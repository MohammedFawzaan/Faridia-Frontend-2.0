import type { PaymentMethod } from '@/types/opd'
import { axiosInstance, responseData } from './axiosInstance'

export const paymentMethodsService = {
  list: async () => responseData<PaymentMethod[]>(await axiosInstance.get('/payment-methods')),
}
