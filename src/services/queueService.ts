import type {
  ConsultationPayload,
  Prescription,
  QueueEntry,
  QueueListQuery,
  QueueStatus,
  QueueSummary,
  QueueSummaryQuery,
} from '@/types/opd'
import { axiosInstance, responseData, responsePage } from './axiosInstance'

export const queueService = {
  list: async (query: QueueListQuery) => responsePage<QueueEntry>(await axiosInstance.get('/queue', { params: query })),
  get: async (id: string) => responseData<QueueEntry>(await axiosInstance.get(`/queue/${id}`)),
  summary: async (query: QueueSummaryQuery) =>
    responseData<QueueSummary>(await axiosInstance.get('/queue/summary', { params: query })),
  addVisit: async (visitId: number) => responseData<QueueEntry>(await axiosInstance.post('/queue', { visitId })),
  setStatus: async (id: number, status: QueueStatus) =>
    responseData<QueueEntry>(await axiosInstance.patch(`/queue/${id}/status`, { status })),
  consult: async (id: number, payload: ConsultationPayload, idempotencyKey: string) =>
    responseData<Prescription>(
      await axiosInstance.post(`/queue/${id}/consultation`, payload, {
        headers: { 'Idempotency-Key': idempotencyKey },
      }),
    ),
}
