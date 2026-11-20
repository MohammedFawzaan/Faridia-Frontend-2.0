import { Link } from 'react-router-dom'
import { ErrorState } from '@/components/ui/StateMessage'

export default function ForbiddenPage() {
  return (
    <ErrorState
      title="You do not have access"
      description="Your role is not allowed to open this page. Ask an administrator if you need access."
      action={
        <Link to="/" className="btn btn-primary">
          Go to home
        </Link>
      }
    />
  )
}
