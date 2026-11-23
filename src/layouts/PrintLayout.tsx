import { Outlet } from 'react-router-dom'

export function PrintLayout() {
  return (
    <main className="min-h-screen bg-base-200 px-3 py-4 print:bg-white print:p-0 sm:px-5">
      <Outlet />
    </main>
  )
}
