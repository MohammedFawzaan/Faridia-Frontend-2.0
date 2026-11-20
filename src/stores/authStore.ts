import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toApiError, type ApiError } from '@/services/apiError'
import { authService } from '@/services/authService'
import { configureAxios } from '@/services/axiosInstance'
import type { ChangePasswordPayload, LoginPayload, UserProfile } from '@/types/auth'
import { toast } from './toastStore'

export type AuthStatus = 'unknown' | 'authenticated' | 'anonymous' | 'error'

interface AuthState {
  token: string | null
  user: UserProfile | null
  status: AuthStatus
  restoreError: ApiError | null
  signIn: (payload: LoginPayload) => Promise<void>
  changePassword: (payload: ChangePasswordPayload) => Promise<void>
  restore: () => Promise<void>
  signOut: () => void
}

const anonymous = { token: null, user: null, status: 'anonymous' as const, restoreError: null }

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      status: 'unknown',
      restoreError: null,

      signIn: async (payload) => {
        const session = await authService.login(payload)
        set({ token: session.accessToken, user: session.user, status: 'authenticated', restoreError: null })
      },

      changePassword: async (payload) => {
        const session = await authService.changePassword(payload)
        set({ token: session.accessToken, user: session.user, status: 'authenticated' })
      },

      restore: async () => {
        if (!get().token) {
          set(anonymous)
          return
        }
        set({ status: 'unknown', restoreError: null })
        try {
          set({ user: await authService.me(), status: 'authenticated' })
        } catch (error) {
          const apiError = toApiError(error)
          if (apiError.kind === 'unauthorized') {
            set(anonymous)
          } else {
            set({ status: 'error', restoreError: apiError })
          }
        }
      },

      signOut: () => set(anonymous),
    }),
    { name: 'faridia-auth', partialize: (state) => ({ token: state.token }) },
  ),
)

configureAxios({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => {
    useAuthStore.getState().signOut()
    toast.warning('Your session has expired. Please sign in again.')
  },
})
