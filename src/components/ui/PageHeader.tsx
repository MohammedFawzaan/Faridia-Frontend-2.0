import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: ReactNode
}

export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid size-12 shrink-0 place-items-center rounded-box bg-primary text-primary-content shadow-sm">
            <Icon className="size-6" aria-hidden="true" />
          </span>
        )}
        <div>
          <h1 className="text-2xl text-secondary sm:text-3xl">{title}</h1>
          {description && <p className="mt-0.5 font-medium">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
