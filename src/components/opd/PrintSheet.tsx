import { ArrowLeft, Printer } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'

interface PrintSheetProps {
  title: string
  children: ReactNode
}

export function PrintSheet({ title, children }: PrintSheetProps) {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden="true" />
          Print
        </Button>
      </div>
      <article className="rounded-box border border-base-300 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex items-center justify-between gap-3 border-b-2 border-secondary pb-3">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="font-heading text-xl font-semibold text-secondary">Faridia Hospital</p>
              <p className="text-sm">Hospital management</p>
            </div>
          </div>
          <h1 className="text-2xl text-secondary">{title}</h1>
        </header>
        {children}
      </article>
    </div>
  )
}

export function PrintField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-secondary">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
