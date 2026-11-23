import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PageMeta } from '@/types/api'

interface PaginationProps {
  meta: PageMeta
  disabled?: boolean
  onPageChange: (page: number) => void
}

export function Pagination({ meta, disabled = false, onPageChange }: PaginationProps) {
  const first = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const last = Math.min(meta.page * meta.limit, meta.total)

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-medium">
        Showing {first}–{last} of {meta.total}
      </p>
      <div className="join">
        <button
          type="button"
          className="btn btn-outline btn-primary join-item btn-sm"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={disabled || meta.page <= 1}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </button>
        <span className="btn btn-primary join-item btn-sm pointer-events-none">
          Page {meta.page} of {meta.totalPages}
        </span>
        <button
          type="button"
          className="btn btn-outline btn-primary join-item btn-sm"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={disabled || meta.page >= meta.totalPages}
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
