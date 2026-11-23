import type { UserRole } from '@/types/auth'

export const ROLE_LABELS: Record<UserRole, string> = {
  Admin: 'Admin',
  'Admin-user': 'Admin user',
  superadmin: 'Super admin',
  it: 'IT',
  reception: 'Reception',
  doctor: 'Doctor',
  nurse: 'Nurse',
  rmo: 'RMO',
  accounts: 'Accounts',
  cashier: 'Cashier',
  medicine: 'Pharmacy',
  dietician: 'Dietician',
  'all-doctor': 'All doctors',
  lab: 'Lab',
  labadmin: 'Lab admin',
  labray: 'Lab (X-ray)',
  screening: 'Screening',
}

export const MANAGE_USERS_ROLES: UserRole[] = ['Admin', 'superadmin', 'it']
export const PATIENT_ROLES: UserRole[] = ['reception', 'Admin', 'superadmin']
export const OPD_DESK_ROLES: UserRole[] = PATIENT_ROLES
export const CONSULT_ROLES: UserRole[] = ['doctor', 'all-doctor']
export const QUEUE_READ_ROLES: UserRole[] = [...OPD_DESK_ROLES, ...CONSULT_ROLES, 'screening']
export const QUEUE_STATUS_ROLES: UserRole[] = [...OPD_DESK_ROLES, ...CONSULT_ROLES]
export const PRESCRIPTION_READ_ROLES: UserRole[] = [...OPD_DESK_ROLES, ...CONSULT_ROLES]
