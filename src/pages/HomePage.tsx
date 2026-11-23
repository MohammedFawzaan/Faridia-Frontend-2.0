import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/ui/StateMessage'
import { useAuthStore } from '@/stores/authStore'
import { navItemsFor } from '@/utils/navigation'
import { ROLE_LABELS } from '@/utils/roles'

const greeting = (now: Date) => {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const user = useAuthStore((state) => state.user)
  const [now] = useState(() => new Date())
  if (!user) return null
  const modules = navItemsFor(user.role)
  const today = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-brand -mx-3 -mt-4 px-4 py-8 text-white sm:mx-0 sm:mt-0 sm:rounded-box sm:px-8 sm:py-10 sm:shadow-md">
        <p className="font-medium">{today}</p>
        <h1 className="mt-1 text-3xl sm:text-4xl">
          {greeting(now)}, {user.name}
        </h1>
        <p className="mt-3 flex items-center gap-2 font-medium">
          Signed in as{' '}
          <span className="badge border-0 bg-white font-semibold text-secondary">{ROLE_LABELS[user.role]}</span>
        </p>
      </section>

      {modules.length === 0 ? (
        <EmptyState
          title="No modules available yet"
          description="Your work areas will appear here as they are added to Faridia 2.0."
        />
      ) : (
        <section aria-label="Your work areas">
          <h2 className="mb-3 text-xl text-secondary">Your work areas</h2>
          <ul className="grid gap-y-1 divide-y divide-base-300 sm:grid-cols-2 sm:gap-4 sm:divide-y-0 xl:grid-cols-3">
            {modules.map(({ to, label, description, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="group flex items-center gap-4 py-3 transition sm:rounded-box sm:border sm:border-base-300 sm:bg-base-100 sm:p-5 sm:shadow-sm sm:hover:-translate-y-0.5 sm:hover:border-primary sm:hover:shadow-md"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-box bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-content">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-lg font-semibold text-secondary">{label}</span>
                    <span className="block text-sm">{description}</span>
                  </span>
                  <ArrowRight
                    className="size-5 shrink-0 text-primary transition group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
