import { FileText, ListPlus, Receipt, Stethoscope } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { Spinner } from '@/components/ui/Loaders'
import { EmptyState, ErrorState } from '@/components/ui/StateMessage'
import { usePagedQuery } from '@/hooks/usePagedQuery'
import { toApiError } from '@/services/apiError'
import { queueService } from '@/services/queueService'
import { visitsService } from '@/services/visitsService'
import { toast } from '@/stores/toastStore'
import type { Visit, VisitListQuery } from '@/types/opd'
import { formatDateTime, formatShortDate, isToday } from '@/utils/date'
import { formatMoney } from '@/utils/money'
import { QueueStatusBadge } from './QueueStatusBadge'

const PAGE_SIZE = 5

export function VisitList({ patientId }: { patientId: string }) {
  const [page, setPage] = useState(1)
  const [queueingId, setQueueingId] = useState<number | null>(null)
  const query = useMemo<VisitListQuery>(() => ({ patientId, page, limit: PAGE_SIZE }), [patientId, page])
  const { items, meta, status, error, reload } = usePagedQuery(visitsService.list, query)

  const handleQueue = async (visit: Visit) => {
    setQueueingId(visit.id)
    try {
      const entry = await queueService.addVisit(visit.id)
      toast.success(`Added to today's queue. Token ${entry.sl} with ${entry.doctor.name}`)
      reload()
    } catch (failure) {
      toast.error(toApiError(failure).message)
    } finally {
      setQueueingId(null)
    }
  }

  if (status === 'loading' && items.length === 0) return <Spinner message="Loading visits…" />
  if (status === 'error' && items.length === 0)
    return (
      <ErrorState
        title="Could not load the visits"
        description={error?.message ?? 'Please try again.'}
        onRetry={reload}
      />
    )
  if (items.length === 0)
    return (
      <EmptyState
        icon={Stethoscope}
        title="No OPD visits yet"
        description="Use “New visit” to register this patient with a doctor."
      />
    )

  return (
    <div className="flex flex-col gap-3">
      {status === 'error' && (
        <Alert kind="warning" title="Showing the last loaded visits">
          {error?.message ?? 'The visits could not be refreshed.'}
        </Alert>
      )}
      <ul
        className={`divide-y divide-base-300 ${status === 'loading' ? 'opacity-60' : ''}`}
        aria-busy={status === 'loading'}
      >
        {items.map((visit) => {
          const canQueue = visit.isValid && (!visit.queue || !isToday(visit.queue.createdAt))
          return (
            <li key={visit.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Stethoscope className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-secondary">
                  {visit.doctor.name} <span className="font-normal">· {visit.department.name}</span>
                </p>
                <p className="text-sm">{visit.symptoms ?? 'No symptoms noted'}</p>
                <p className="text-sm">{formatDateTime(visit.createdAt)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {visit.queue && (
                  <>
                    <span className="badge badge-primary font-semibold">Token {visit.queue.sl}</span>
                    {isToday(visit.queue.createdAt) && <QueueStatusBadge status={visit.queue.status} />}
                  </>
                )}
                {visit.isValid ? (
                  <span className="badge badge-success badge-outline font-semibold">
                    Valid till {formatShortDate(visit.validUntil)}
                  </span>
                ) : (
                  <span className="badge badge-outline font-semibold">Expired</span>
                )}
                {visit.bill && (
                  <Link
                    to={`/bills/${visit.bill.id}/print`}
                    className="btn btn-ghost btn-sm"
                    aria-label={`Bill ${visit.bill.number}`}
                  >
                    <Receipt className="size-4" aria-hidden="true" />
                    Bill {visit.bill.number} · {formatMoney(visit.bill.total)}
                  </Link>
                )}
                {visit.prescriptionId && (
                  <Link to={`/prescriptions/${visit.prescriptionId}/print`} className="btn btn-ghost btn-sm">
                    <FileText className="size-4" aria-hidden="true" />
                    Prescription
                  </Link>
                )}
                {canQueue && (
                  <Button
                    variant="outline"
                    className="btn-sm"
                    onClick={() => handleQueue(visit)}
                    loading={queueingId === visit.id}
                    loadingText="Adding…"
                    disabled={queueingId !== null}
                  >
                    <ListPlus className="size-4" aria-hidden="true" />
                    Add to today&apos;s queue
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      {meta && meta.total > PAGE_SIZE && (
        <Pagination meta={meta} disabled={status === 'loading'} onPageChange={setPage} />
      )}
    </div>
  )
}
