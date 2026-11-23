import { CircleCheck, Clock } from 'lucide-react'
import type { QueueStatus } from '@/types/opd'

export function QueueStatusBadge({ status }: { status: QueueStatus }) {
  return status === 'waiting' ? (
    <span className="badge badge-warning gap-1 font-semibold">
      <Clock className="size-3.5" aria-hidden="true" />
      Waiting
    </span>
  ) : (
    <span className="badge badge-success gap-1 font-semibold">
      <CircleCheck className="size-3.5" aria-hidden="true" />
      Done
    </span>
  )
}
