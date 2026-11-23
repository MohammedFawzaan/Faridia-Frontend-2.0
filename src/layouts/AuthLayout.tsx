import { ClipboardList, ShieldCheck, Stethoscope } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'

const HIGHLIGHTS = [
  { icon: ClipboardList, text: 'Register patients and visits in seconds' },
  { icon: Stethoscope, text: 'Keep every doctor’s queue moving' },
  { icon: ShieldCheck, text: 'Role-based access for every staff member' },
]

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="bg-brand relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <span className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10" aria-hidden="true" />
        <span className="absolute -bottom-32 -left-16 size-96 rounded-full bg-white/10" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-box bg-white">
            <Logo />
          </span>
          <span className="font-heading text-2xl font-semibold">Faridia Hospital</span>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-semibold leading-tight">Care that starts at the front desk.</h2>
          <ul className="mt-8 flex flex-col gap-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-lg">
                <span className="grid size-10 place-items-center rounded-full bg-white/20">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm">Faridia 2.0 · Hospital management</p>
      </aside>

      <main className="flex flex-col items-center justify-center bg-base-100 px-4 py-10 sm:px-8">
        <div className="mb-6 flex flex-col items-center text-center lg:hidden">
          <Logo size="lg" />
          <h1 className="mt-2 text-3xl text-secondary">Faridia Hospital</h1>
        </div>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
