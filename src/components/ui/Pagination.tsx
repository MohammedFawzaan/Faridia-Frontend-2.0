import type { PageMeta } from '@/types/api'
import { Button } from './Button'

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
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => onPageChange(meta.page - 1)} disabled={disabled || meta.page <= 1}>
          Previous
        </Button>
        <span className="text-sm font-semibold">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button variant="outline" onClick={() => onPageChange(meta.page + 1)} disabled={disabled || meta.page >= meta.totalPages}>
          Next
        </Button>
      </div>
    </nav>
  )
}
