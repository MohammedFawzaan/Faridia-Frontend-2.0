import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'

export function AuthLayout() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-base-200 px-4 py-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <Logo size="lg" />
        <h1 className="mt-2 text-3xl text-secondary">Faridia Hospital</h1>
        <p className="mt-1 font-medium">Manage your patients with care</p>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </main>
  )
}
