import { useEffect } from 'react'
import { useToastStore, type Toast } from '@/stores/toastStore'

const TOAST_MS = 5000

const KIND_CLASS: Record<Toast['kind'], string> = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss)

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [dismiss, toast.id])

  return (
    <div role={toast.kind === 'error' ? 'alert' : 'status'} className={`alert ${KIND_CLASS[toast.kind]} shadow-lg`}>
      <span className="font-medium">{toast.message}</span>
      <button
        type="button"
        className="btn btn-ghost btn-xs"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss message"
      >
        Close
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  if (toasts.length === 0) return null

  return (
    <div className="fixed right-4 bottom-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
