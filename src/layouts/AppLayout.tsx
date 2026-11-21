import { Link, NavLink, Outlet } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { navItemsFor } from '@/utils/navigation'
import { ROLE_LABELS } from '@/utils/roles'

export function AppLayout() {
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const navItems = user ? navItemsFor(user.role) : []

  return (
    <div className="min-h-screen bg-base-200">
      <header className="border-b border-base-300 bg-base-100">
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <Logo />
              <span className="font-heading text-lg font-semibold text-primary">Welcome to Faridia Hospital</span>
            </Link>
            <nav aria-label="Main" className="flex gap-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden text-right sm:block">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm">{ROLE_LABELS[user.role]}</p>
              </div>
            )}
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="px-3 py-4 sm:px-4">
        <Outlet />
      </main>
    </div>
  )
}
