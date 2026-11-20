import { ErrorState } from '@/components/ui/StateMessage'

export default function RouteErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <ErrorState
        title="This page could not be displayed"
        description="An unexpected error occurred. Reload the page and try again."
        onRetry={() => window.location.reload()}
      />
    </div>
  )
}
