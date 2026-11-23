import { LayoutDashboard, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { useAuthStore } from '@/stores/authStore'
import { initialsOf } from '@/utils/initials'
import { navItemsFor } from '@/utils/navigation'
import { ROLE_LABELS } from '@/utils/roles'

export function AppLayout() {
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const [open, setOpen] = useState(false)
  const navItems = user ? navItemsFor(user.role) : []
  const closeMenu = () => setOpen(false)
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `gap-3 py-2.5 font-semibold ${isActive ? 'menu-active bg-white text-secondary shadow-sm' : 'text-secondary-content hover:bg-white/10'}`

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="app-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={(event) => setOpen(event.target.checked)}
        aria-label="Toggle menu"
      />

      <div className="drawer-content flex min-h-screen flex-col">
        <header className="navbar sticky top-0 z-30 min-h-14 gap-2 border-b border-base-300 bg-base-100 px-3 lg:hidden">
          <label htmlFor="app-drawer" className="btn btn-ghost btn-square btn-sm" aria-label="Open menu">
            <Menu className="size-5" aria-hidden="true" />
          </label>
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-heading text-lg font-semibold text-primary">Faridia Hospital</span>
          </Link>
        </header>
        <main className="flex-1 px-3 py-4 sm:px-5 sm:py-6">
          <Outlet />
        </main>
      </div>

      <div className="drawer-side z-40">
        <label htmlFor="app-drawer" aria-label="Close menu" className="drawer-overlay" />
        <aside className="flex min-h-full w-64 flex-col bg-secondary text-secondary-content">
          <Link to="/" onClick={closeMenu} className="flex items-center gap-3 px-4 py-5">
            <span className="grid size-11 place-items-center rounded-box bg-white">
              <Logo />
            </span>
            <span className="font-heading text-lg font-semibold leading-tight">
              Faridia
              <br />
              Hospital
            </span>
          </Link>

          <nav aria-label="Main" className="flex-1 px-3">
            <ul className="menu w-full gap-1 p-0">
              <li>
                <NavLink to="/" end onClick={closeMenu} className={linkClass}>
                  <LayoutDashboard className="size-5" aria-hidden="true" />
                  Home
                </NavLink>
              </li>
              {navItems.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink to={to} onClick={closeMenu} className={linkClass}>
                    <Icon className="size-5" aria-hidden="true" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {user && (
            <div className="m-3 flex items-center gap-3 rounded-box bg-white/10 p-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-semibold text-primary-content">
                {initialsOf(user.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="text-sm">{ROLE_LABELS[user.role]}</p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-square btn-sm text-secondary-content hover:bg-white/10"
                onClick={signOut}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="size-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
