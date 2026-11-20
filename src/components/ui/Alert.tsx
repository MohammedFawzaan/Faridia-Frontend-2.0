import type { ReactNode } from 'react'

type Kind = 'error' | 'success' | 'warning' | 'info'

const KIND_CLASS: Record<Kind, string> = {
  error: 'alert-error',
  success: 'alert-success',
  warning: 'alert-warning',
  info: 'alert-info',
}

interface AlertProps {
  kind: Kind
  title?: string
  children: ReactNode
  className?: string
}

export function Alert({ kind, title, children, className = '' }: AlertProps) {
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`alert ${KIND_CLASS[kind]} items-start ${className}`}>
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p className="text-sm">{children}</p>
      </div>
    </div>
  )
}
