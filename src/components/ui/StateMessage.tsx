import type { ReactNode } from 'react'
import { Button } from './Button'

interface StateMessageProps {
  title: string
  description: string
  action?: ReactNode
  tone?: 'neutral' | 'error'
}

function StateMessage({ title, description, action, tone = 'neutral' }: StateMessageProps) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className="flex flex-col items-center gap-3 px-4 py-12 text-center">
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
