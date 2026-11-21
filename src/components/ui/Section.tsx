import type { ReactNode } from 'react'

interface SectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function Section({ title, description, children, className = '' }: SectionProps) {
  return (
    <section className={`flex w-full flex-col gap-4 ${className}`}>
      {(title || description) && (
        <header>
          {title && <h2 className="text-2xl text-secondary">{title}</h2>}
          {description && <p className="mt-1 text-sm">{description}</p>}
        </header>
      )}
      {children}
    </section>
  )
}
