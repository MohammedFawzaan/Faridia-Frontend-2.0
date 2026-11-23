import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

type Kind = 'error' | 'success' | 'warning' | 'info'

const KIND_CLASS: Record<Kind, string> = {
  error: 'alert-error',
  success: 'alert-success',
  warning: 'alert-warning',
  info: 'alert-info',
}

const KIND_ICON = { error: CircleAlert, success: CircleCheck, warning: TriangleAlert, info: Info }

interface AlertProps {
  kind: Kind
  title?: string
  children: ReactNode
  className?: string
}

export function Alert({ kind, title, children, className = '' }: AlertProps) {
  const Icon = KIND_ICON[kind]
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`alert ${KIND_CLASS[kind]} items-start ${className}`}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p className="text-sm">{children}</p>
      </div>
    </div>
  )
}
