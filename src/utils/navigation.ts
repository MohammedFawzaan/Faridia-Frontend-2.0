import type { UserRole } from '@/types/auth'
import { MANAGE_USERS_ROLES, PATIENT_ROLES } from './roles'

export interface NavItem {
  label: string
  to: string
  description: string
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Patients', to: '/patients', description: 'Find, register and update patients.', roles: PATIENT_ROLES },
  { label: 'Users', to: '/users', description: 'Manage staff accounts, roles and passwords.', roles: MANAGE_USERS_ROLES },
]

export const navItemsFor = (role: UserRole) => NAV_ITEMS.filter((item) => item.roles.includes(role))
