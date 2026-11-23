import { ListOrdered, Stethoscope, UserCog, UsersRound, type LucideIcon } from 'lucide-react'
import type { UserRole } from '@/types/auth'
import { MANAGE_USERS_ROLES, PATIENT_ROLES, QUEUE_READ_ROLES } from './roles'

export interface NavItem {
  label: string
  to: string
  description: string
  icon: LucideIcon
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Patients',
    to: '/patients',
    description: 'Find, register and update patients, and register their visits.',
    icon: UsersRound,
    roles: PATIENT_ROLES,
  },
  {
    label: 'Queue',
    to: '/queue',
    description: 'See who is waiting today and keep the OPD queue moving.',
    icon: ListOrdered,
    roles: QUEUE_READ_ROLES,
  },
  {
    label: 'Doctors',
    to: '/doctors',
    description: 'Add and edit the doctors patients are registered with.',
    icon: Stethoscope,
    roles: MANAGE_USERS_ROLES,
  },
  {
    label: 'Users',
    to: '/users',
    description: 'Manage staff accounts, roles and passwords.',
    icon: UserCog,
    roles: MANAGE_USERS_ROLES,
  },
]

export const navItemsFor = (role: UserRole) => NAV_ITEMS.filter((item) => item.roles.includes(role))
