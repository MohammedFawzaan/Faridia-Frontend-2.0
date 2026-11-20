interface LoaderProps {
  message?: string
}

export function Spinner({ message = 'Loading…' }: LoaderProps) {
  return (
    <div role="status" className="flex items-center gap-3">
      <span className="loading loading-spinner loading-md text-primary" aria-hidden="true" />
      <span className="font-medium">{message}</span>
    </div>
  )
}

export function FullPageLoader({ message = 'Loading…' }: LoaderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <Spinner message={message} />
    </div>
  )
}
