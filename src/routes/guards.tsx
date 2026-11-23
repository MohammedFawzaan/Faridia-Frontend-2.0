import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/StateMessage'
import { FullPageLoader } from '@/components/ui/Loaders'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types/auth'

interface RedirectState {
  from?: string
}

export function RequireAuth() {
  const status = useAuthStore((state) => state.status)
  const restoreError = useAuthStore((state) => state.restoreError)
  const restore = useAuthStore((state) => state.restore)
  const signOut = useAuthStore((state) => state.signOut)
  const location = useLocation()

  useEffect(() => {
    if (status === 'unknown') void restore()
  }, [status, restore])

  if (status === 'unknown') return <FullPageLoader message="Restoring your session…" />

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200">
        <ErrorState
          title="We could not restore your session"
          description={restoreError?.message ?? 'Please try again.'}
          action={
            <div className="flex gap-2">
              <Button onClick={() => void restore()}>Try again</Button>
              <Button variant="outline" onClick={signOut}>
                Sign in again
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  if (status === 'anonymous') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` } satisfies RedirectState}
      />
    )
  }
  return <Outlet />
}

export function PublicOnly() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (status === 'authenticated' && user) {
    const from = (location.state as RedirectState | null)?.from
    return <Navigate to={user.mustResetPassword ? '/change-password' : (from ?? '/')} replace />
  }
  return <Outlet />
}

export function RequirePasswordSet() {
  const mustResetPassword = useAuthStore((state) => state.user?.mustResetPassword)
  return mustResetPassword ? <Navigate to="/change-password" replace /> : <Outlet />
}

interface RequireRoleProps {
  roles: UserRole[]
}

export function RequireRole({ roles }: RequireRoleProps) {
  const role = useAuthStore((state) => state.user?.role)
  return role && roles.includes(role) ? <Outlet /> : <Navigate to="/forbidden" replace />
}
