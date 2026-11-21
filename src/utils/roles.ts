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
}

export const MANAGE_USERS_ROLES: UserRole[] = ['Admin', 'superadmin', 'it']
export const PATIENT_ROLES: UserRole[] = ['reception', 'Admin', 'superadmin']
