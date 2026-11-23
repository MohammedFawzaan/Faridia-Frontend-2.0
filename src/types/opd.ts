import type { Gender } from './patient'

export type AgeType = 'year' | 'month' | 'day'

export interface Doctor {
  id: number
  name: string
  graduation: string
  postGraduation: string | null
  departmentId: number | null
  departmentName: string | null
  consultationFee: string
}

export interface Department {
  id: number
  name: string
  type: 'OPD' | 'IPD'
}

export interface PaymentMethod {
  id: number
  name: string
  logo: string | null
}

export interface Symptom {
  id: number
  name: string
}

export interface Medicine {
  id: number
  name: string
  isFree: boolean
}

export interface BillSummary {
  id: number
  number: string
  total: string
}

export type QueueStatus = 'waiting' | 'done'

export interface PatientBrief {
  patientId: string
  name: string
  age: number
  ageType: AgeType
  gender: Gender
  mobile: string
}

export interface QueueEntry {
  id: number
  visitId: number
  sl: number
  yearIpdId: number
  status: QueueStatus
  symptom: string | null
  visitSymptoms: string | null
  createdAt: string
  patient: PatientBrief & { photoPath: string | null }
  doctor: { id: number; name: string }
  department: { id: number; name: string }
  bill: BillSummary | null
  prescriptionId: number | null
}

export interface QueueSummary {
  waiting: number
  done: number
  total: number
}

export interface QueueListQuery {
  page: number
  limit: number
  date?: string
  doctorId?: number
  departmentId?: number
  status?: QueueStatus
  search?: string
}

export type QueueSummaryQuery = Pick<QueueListQuery, 'date' | 'doctorId' | 'departmentId'>

export interface Visit {
  id: number
  patientId: string
  symptoms: string | null
  validUntil: string
  isValid: boolean
  createdBy: string
  createdAt: string
  doctor: { id: number; name: string }
  department: { id: number; name: string }
  queue: { id: number; sl: number; yearIpdId: number; status: QueueStatus; createdAt: string } | null
  bill: BillSummary | null
  prescriptionId: number | null
}

export interface VisitListQuery {
  patientId: string
  page: number
  limit: number
}

export interface VisitPayload {
  patientId: string
  doctorId: number
  departmentId: number
  paymentMethodId: number
  symptoms?: string
}

export interface Bill extends BillSummary {
  createdAt: string
  createdByName: string
  paymentMethod: { id: number; name: string } | null
  patient: PatientBrief
  doctor: { name: string; graduation: string; postGraduation: string | null }
  department: { name: string }
  opdNumber: number | null
  items: { details: string; amount: string }[]
}

export interface ConsultationMedicinePayload {
  medicineId?: number
  name?: string
  qty: number
}

export interface ConsultationPayload {
  symptoms: string[]
  remarks?: string
  medicines: ConsultationMedicinePayload[]
}

export interface Prescription {
  id: number
  createdAt: string
  createdByName: string
  symptoms: string | null
  advice: string | null
  remarks: string | null
  opdNumber: number
  token: number
  patient: PatientBrief
  doctor: { name: string; graduation: string; postGraduation: string | null }
  department: { name: string }
  medicines: { id: number; medicine: string; qty: number; free: boolean }[]
}
