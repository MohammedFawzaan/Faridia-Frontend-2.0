export type UserRole =
  | 'Admin'
  | 'Admin-user'
  | 'superadmin'
  | 'it'
  | 'reception'
  | 'doctor'
  | 'nurse'
  | 'rmo'
  | 'accounts'
  | 'cashier'
  | 'medicine'
  | 'dietician'
  | 'all-doctor'
  | 'lab'
  | 'labadmin'
  | 'labray'

export interface UserProfile {
  id: number
  name: string
  mobile: string
  role: UserRole
  doctorId: number | null
  labDepartmentId: number | null
  mustResetPassword: boolean
}

export interface AuthSession {
  accessToken: string
  user: UserProfile
}

export interface LoginPayload {
  mobile: string
  password: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}
