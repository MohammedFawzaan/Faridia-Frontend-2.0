import type { Gender, Patient } from '@/types/patient'

export const GENDER_LABELS: Record<Gender, string> = { male: 'Male', female: 'Female', other: 'Other' }

export const formatAge = (patient: Pick<Patient, 'age' | 'ageType'>) => `${patient.age} ${patient.ageType}${patient.age === 1 ? '' : 's'}`

export const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')
