import type { Visit, VisitListQuery, VisitPayload } from '@/types/opd'
import { axiosInstance, responseData, responsePage } from './axiosInstance'

export const visitsService = {
  list: async (query: VisitListQuery) => responsePage<Visit>(await axiosInstance.get('/visits', { params: query })),
  create: async (payload: VisitPayload, idempotencyKey: string) =>
    responseData<Visit>(
      await axiosInstance.post('/visits', payload, { headers: { 'Idempotency-Key': idempotencyKey } }),
    ),
}
