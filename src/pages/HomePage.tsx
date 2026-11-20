import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/StateMessage'
import { useAuthStore } from '@/stores/authStore'
import { ROLE_LABELS } from '@/utils/roles'

export default function HomePage() {
  const user = useAuthStore((state) => state.user)
  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl text-secondary">Welcome, {user.name}</h1>
        <p className="mt-1 flex items-center gap-2 font-medium">
          Signed in as <span className="badge badge-primary">{ROLE_LABELS[user.role]}</span>
        </p>
      </div>
      <Card>
        <EmptyState title="No modules available yet" description="Your work areas will appear here as they are added to Faridia 2.0." />
      </Card>
    </div>
  )
}
