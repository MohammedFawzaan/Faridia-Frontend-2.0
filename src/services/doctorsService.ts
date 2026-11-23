import type { DoctorAdmin, DoctorListQuery, DoctorPayload } from '@/types/doctor'
import type { Doctor } from '@/types/opd'
import { axiosInstance, responseData, responsePage } from './axiosInstance'

export const doctorsService = {
  list: async (departmentId?: number) =>
    responseData<Doctor[]>(await axiosInstance.get('/doctors', { params: { departmentId } })),
  listManage: async (query: DoctorListQuery) =>
    responsePage<DoctorAdmin>(await axiosInstance.get('/doctors/manage', { params: query })),
  create: async (payload: DoctorPayload) => responseData<DoctorAdmin>(await axiosInstance.post('/doctors', payload)),
  update: async (id: number, payload: Partial<DoctorPayload>) =>
    responseData<DoctorAdmin>(await axiosInstance.patch(`/doctors/${id}`, payload)),
}
