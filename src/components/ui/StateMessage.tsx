import { Inbox, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

interface StateMessageProps {
  title: string
  description: string
  action?: ReactNode
  tone?: 'neutral' | 'error'
  icon?: LucideIcon
}

function StateMessage({ title, description, action, tone = 'neutral', icon }: StateMessageProps) {
  const Icon = icon ?? (tone === 'error' ? TriangleAlert : Inbox)
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className="flex flex-col items-center gap-3 px-4 py-12 text-center"
    >
      <span
        className={`grid size-16 place-items-center rounded-full ${tone === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}
      >
        <Icon className="size-8" aria-hidden="true" />
      </span>
      <h2 className={`text-2xl ${tone === 'error' ? 'text-error' : 'text-secondary'}`}>{title}</h2>
      <p className="max-w-md">{description}</p>
      {action}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
  icon?: LucideIcon
}

export function EmptyState(props: EmptyStateProps) {
  return <StateMessage {...props} />
}

interface ErrorStateProps {
  title?: string
  description: string
  onRetry?: () => void
  action?: ReactNode
}

export function ErrorState({ title = 'Something went wrong', description, onRetry, action }: ErrorStateProps) {
  return (
    <StateMessage
      tone="error"
      title={title}
      description={description}
      action={action ?? (onRetry && <Button onClick={onRetry}>Try again</Button>)}
    />
  )
}
