import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null

  return (
    <div role="status" className="sticky top-0 z-50 bg-warning px-4 py-2 text-center text-sm font-semibold text-warning-content">
      You are offline. Actions that need the server will not work until the connection returns.
    </div>
  )
}
