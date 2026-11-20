import { Outlet } from 'react-router-dom'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { Toaster } from '@/components/ui/Toaster'

export function RootLayout() {
  return (
    <>
      <OfflineBanner />
      <Outlet />
      <Toaster />
    </>
  )
}
