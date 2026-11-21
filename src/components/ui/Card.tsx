import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <section className="sm:rounded-box sm:border sm:border-base-300 sm:bg-base-100 sm:p-4">
      {title && <h2 className="mb-3 text-xl text-secondary">{title}</h2>}
      {children}
    </section>
  )
}
