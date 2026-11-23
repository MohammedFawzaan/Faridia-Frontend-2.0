import type { Patient, PatientListQuery, PatientPayload } from '@/types/patient'
import { axiosInstance, responseData, responsePage } from './axiosInstance'

export const patientsService = {
  list: async (query: PatientListQuery) =>
    responsePage<Patient>(await axiosInstance.get('/patients', { params: query })),
  get: async (patientId: string) => responseData<Patient>(await axiosInstance.get(`/patients/${patientId}`)),
  create: async (payload: PatientPayload) => responseData<Patient>(await axiosInstance.post('/patients', payload)),
  update: async (patientId: string, payload: Partial<PatientPayload>) =>
    responseData<Patient>(await axiosInstance.patch(`/patients/${patientId}`, payload)),
}
