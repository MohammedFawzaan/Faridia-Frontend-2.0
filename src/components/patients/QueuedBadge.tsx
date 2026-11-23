import { ListOrdered } from 'lucide-react'
import type { TodayQueue } from '@/types/patient'

interface QueuedBadgeProps {
  todayQueue: TodayQueue
  className?: string
}

export function QueuedBadge({ todayQueue, className = '' }: QueuedBadgeProps) {
  return (
    <span
      className={`badge badge-warning h-auto max-w-full items-start gap-1 whitespace-normal py-1 text-left font-semibold ${className}`}
    >
      <ListOrdered className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>
        In queue today · Token {todayQueue.sl}
        <span className="block sm:inline">
          <span className="hidden sm:inline"> · </span>
          {todayQueue.doctorName} · {todayQueue.status === 'waiting' ? 'Waiting' : 'Seen'}
        </span>
      </span>
    </span>
  )
}
