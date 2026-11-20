import { Link } from 'react-router-dom'
import { ErrorState } from '@/components/ui/StateMessage'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <ErrorState
        title="Page not found"
        description="The page you are looking for does not exist or has moved."
        action={
          <Link to="/" className="btn btn-primary">
            Go to home
          </Link>
        }
      />
    </div>
  )
}
