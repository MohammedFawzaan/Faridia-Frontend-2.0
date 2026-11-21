import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/ui/StateMessage'
import { useAuthStore } from '@/stores/authStore'
import { navItemsFor } from '@/utils/navigation'
import { ROLE_LABELS } from '@/utils/roles'

export default function HomePage() {
  const user = useAuthStore((state) => state.user)
  if (!user) return null
  const modules = navItemsFor(user.role)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl text-secondary">Welcome, {user.name}</h1>
        <p className="mt-1 flex items-center gap-2 font-medium">
          Signed in as <span className="badge badge-primary">{ROLE_LABELS[user.role]}</span>
        </p>
      </div>
      {modules.length === 0 ? (
        <EmptyState title="No modules available yet" description="Your work areas will appear here as they are added to Faridia 2.0." />
      ) : (
        <ul className="divide-y divide-base-300 border-y border-base-300">
          {modules.map((module) => (
            <li key={module.to}>
              <Link to={module.to} className="flex flex-col gap-0.5 py-3 hover:bg-base-300/40">
                <span className="text-lg font-semibold text-primary">{module.label}</span>
                <span>{module.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
