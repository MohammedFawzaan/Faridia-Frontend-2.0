import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function Card({ title, description, children, className = '' }: CardProps) {
  return (
    <section className={`card w-full border border-base-300 bg-base-100 shadow-md ${className}`}>
      <div className="card-body gap-4">
        {(title || description) && (
          <header>
            {title && <h2 className="text-2xl text-secondary">{title}</h2>}
            {description && <p className="mt-1 text-sm">{description}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}
