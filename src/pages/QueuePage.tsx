import {
  CircleCheck,
  ClipboardPlus,
  Clock,
  FileText,
  ListOrdered,
  Receipt,
  RotateCcw,
  Search,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useMemo, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { QueueStatusBadge } from '@/components/opd/QueueStatusBadge'
import { PatientAvatar } from '@/components/patients/PatientAvatar'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagedQuery } from '@/hooks/usePagedQuery'
import { useResource } from '@/hooks/useResource'
import { toApiError } from '@/services/apiError'
import { departmentsService } from '@/services/departmentsService'
import { doctorsService } from '@/services/doctorsService'
import { queueService } from '@/services/queueService'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/stores/toastStore'
import type { QueueEntry, QueueListQuery, QueueStatus, QueueSummaryQuery } from '@/types/opd'
import { formatTime, todayKey } from '@/utils/date'
import { formatAge, GENDER_LABELS } from '@/utils/patient'
import { CONSULT_ROLES, OPD_DESK_ROLES, PATIENT_ROLES, QUEUE_STATUS_ROLES } from '@/utils/roles'

const PAGE_SIZE = 20
const STATUS_FILTER = [
  { value: 'waiting', label: 'Waiting' },
  { value: 'done', label: 'Done' },
]

interface StatTileProps {
  label: string
  value: number | null
  icon: LucideIcon
  tone: string
}

function StatTile({ label, value, icon: Icon, tone }: StatTileProps) {
  return (
    <div className="flex items-center gap-3 sm:rounded-box sm:border sm:border-base-300 sm:bg-base-100 sm:p-4 sm:shadow-sm">
      <span className={`grid size-11 shrink-0 place-items-center rounded-full ${tone}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-heading text-2xl font-semibold leading-none text-secondary">{value ?? '—'}</p>
        <p className="mt-1 text-sm font-semibold">{label}</p>
      </div>
    </div>
  )
}

export default function QueuePage() {
  const role = useAuthStore((state) => state.user?.role)
  const isDoctor = role === 'doctor'
  const canChangeStatus = role ? QUEUE_STATUS_ROLES.includes(role) : false
  const canOpenPatient = role ? PATIENT_ROLES.includes(role) : false
  const isDeskRole = role ? OPD_DESK_ROLES.includes(role) : false
  const isConsultRole = role ? CONSULT_ROLES.includes(role) : false

  const [date, setDate] = useState(todayKey)
  const [doctorId, setDoctorId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [status, setStatus] = useState<QueueStatus | ''>('')
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [reopening, setReopening] = useState<QueueEntry | null>(null)

  const search = useDebounce(searchText.trim(), 500)
  const scope = useMemo<QueueSummaryQuery>(
    () => ({
      date,
      doctorId: doctorId ? Number(doctorId) : undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
    }),
    [date, doctorId, departmentId],
  )
  const query = useMemo<QueueListQuery>(
    () => ({
      ...scope,
      page,
      limit: PAGE_SIZE,
      status: status || undefined,
      search: search || undefined,
    }),
    [scope, page, status, search],
  )

  const queue = usePagedQuery(queueService.list, query)
  const summary = useResource(queueService.summary, scope)
  const doctors = useResource(doctorsService.list, undefined)
  const departments = useResource(departmentsService.list, 'OPD')
  const filtered = Boolean(search || status || doctorId || departmentId)
  const isToday = date === todayKey()

  const { reload: reloadQueue } = queue
  const { reload: reloadSummary } = summary
  const refresh = useCallback(() => {
    reloadQueue()
    reloadSummary()
  }, [reloadQueue, reloadSummary])

  const handleFilter =
    <T,>(setter: (value: T) => void) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      setter(event.target.value as T)
      setPage(1)
    }

  const handleStatusChange = async (entry: QueueEntry) => {
    setUpdatingId(entry.id)
    try {
      await queueService.setStatus(entry.id, entry.status === 'waiting' ? 'done' : 'waiting')
      refresh()
    } catch (error) {
      toast.error(toApiError(error).message)
    } finally {
      setUpdatingId(null)
    }
  }

  const columns: Column<QueueEntry>[] = [
    {
      key: 'sl',
      header: 'Token',
      mobileHidden: true,
      render: (entry) => <span className="badge badge-primary badge-lg font-heading font-semibold">{entry.sl}</span>,
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (entry) => (
        <div className="flex items-center gap-3">
          <span className="badge badge-primary font-heading font-semibold sm:hidden" aria-label={`Token ${entry.sl}`}>
            {entry.sl}
          </span>
          <PatientAvatar patient={entry.patient} size="sm" className="hidden sm:inline-flex" />
          <div className="min-w-0">
            {canOpenPatient ? (
              <Link to={`/patients/${entry.patient.patientId}`} className="link-hover font-semibold text-secondary">
                {entry.patient.name}
              </Link>
            ) : (
              <p className="font-semibold text-secondary">{entry.patient.name}</p>
            )}
            <p className="text-sm">
              {entry.patient.patientId} · {formatAge(entry.patient)} · {GENDER_LABELS[entry.patient.gender]}
            </p>
            <p className="text-sm sm:hidden">
              {entry.doctor.name} · {entry.department.name} · {formatTime(entry.createdAt)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'doctor',
      header: 'Doctor',
      mobileHidden: true,
      render: (entry) => (
        <div>
          <p className="font-semibold">{entry.doctor.name}</p>
          <p className="text-sm">{entry.department.name}</p>
        </div>
      ),
    },
    {
      key: 'mobile',
      header: 'Mobile',
      mobileHidden: true,
      render: (entry) => entry.patient.mobile,
    },
    {
      key: 'time',
      header: 'Arrived',
      mobileHidden: true,
      render: (entry) => formatTime(entry.createdAt),
    },
    {
      key: 'status',
      header: 'Status',
      render: (entry) => <QueueStatusBadge status={entry.status} />,
    },
    ...(canChangeStatus
      ? [
          {
            key: 'actions',
            header: 'Actions',
            render: (entry: QueueEntry) => (
              <div className="flex flex-wrap gap-1">
                {isConsultRole && entry.status === 'waiting' && (
                  <Link
                    to={`/queue/${entry.id}/consult`}
                    className="btn btn-primary btn-sm"
                    aria-label={`Consult: ${entry.patient.name}`}
                  >
                    <ClipboardPlus className="size-4" aria-hidden="true" />
                    <span className="hidden lg:inline">Consult</span>
                  </Link>
                )}
                {isDeskRole && (
                  <Button
                    variant={entry.status === 'waiting' ? 'primary' : 'outline'}
                    className="btn-sm"
                    onClick={() => (entry.status === 'waiting' ? handleStatusChange(entry) : setReopening(entry))}
                    loading={updatingId === entry.id}
                    disabled={updatingId !== null}
                    aria-label={`${entry.status === 'waiting' ? 'Mark done' : 'Reopen'}: ${entry.patient.name}`}
                  >
                    {entry.status === 'waiting' ? (
                      <CircleCheck className="size-4" aria-hidden="true" />
                    ) : (
                      <RotateCcw className="size-4" aria-hidden="true" />
                    )}
                    <span className="hidden lg:inline">{entry.status === 'waiting' ? 'Mark done' : 'Reopen'}</span>
                  </Button>
                )}
                {isDeskRole && entry.bill && (
                  <Link
                    to={`/bills/${entry.bill.id}/print`}
                    className="btn btn-outline btn-primary btn-sm"
                    aria-label={`Bill ${entry.bill.number}: ${entry.patient.name}`}
                  >
                    <Receipt className="size-4" aria-hidden="true" />
                    <span className="hidden lg:inline">Bill</span>
                  </Link>
                )}
                {entry.prescriptionId && (
                  <Link
                    to={`/prescriptions/${entry.prescriptionId}/print`}
                    className="btn btn-outline btn-primary btn-sm"
                    aria-label={`Prescription: ${entry.patient.name}`}
                  >
                    <FileText className="size-4" aria-hidden="true" />
                    <span className="hidden lg:inline">Prescription</span>
                  </Link>
                )}
              </div>
            ),
          },
        ]
      : []),
  ]

  const doctorOptions = (doctors.data ?? []).map((doctor) => ({
    value: String(doctor.id),
    label: doctor.name,
  }))
  const departmentOptions = (departments.data ?? []).map((department) => ({
    value: String(department.id),
    label: department.name,
  }))

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={ListOrdered}
        title={isDoctor ? 'My queue' : 'OPD queue'}
        description={
          isToday ? 'Today’s patients, in the order they arrived.' : 'Patients registered on the selected day.'
        }
      />

      <div className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Queue summary">
        <StatTile label="Total" value={summary.data?.total ?? null} icon={Users} tone="bg-primary/10 text-primary" />
        <StatTile
          label="Waiting"
          value={summary.data?.waiting ?? null}
          icon={Clock}
          tone="bg-warning/30 text-warning-content"
        />
        <StatTile
          label="Done"
          value={summary.data?.done ?? null}
          icon={CircleCheck}
          tone="bg-success/15 text-success"
        />
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="col-span-2 flex items-end gap-2 lg:col-span-1">
            <div className="flex-1">
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value || todayKey())
                  setPage(1)
                }}
              />
            </div>
            {!isToday && (
              <Button
                variant="outline"
                onClick={() => {
                  setDate(todayKey())
                  setPage(1)
                }}
              >
                Today
              </Button>
            )}
          </div>
          {!isDoctor && (
            <SelectField
              label="Doctor"
              placeholder="All doctors"
              options={doctorOptions}
              value={doctorId}
              onChange={handleFilter(setDoctorId)}
            />
          )}
          {!isDoctor && (
            <SelectField
              label="Department"
              placeholder="All departments"
              options={departmentOptions}
              value={departmentId}
              onChange={handleFilter(setDepartmentId)}
            />
          )}
          <SelectField
            label="Status"
            placeholder="All"
            options={STATUS_FILTER}
            value={status}
            onChange={handleFilter(setStatus)}
          />
          <div className="col-span-2 lg:col-span-1">
            <TextField
              label="Search"
              type="search"
              leading={<Search className="size-4" />}
              placeholder="Name, mobile or id"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value)
                setPage(1)
              }}
              hint={searchText.trim() !== search ? 'Searching…' : undefined}
            />
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        rows={queue.items}
        rowKey={(entry) => entry.id}
        status={queue.status}
        errorMessage={queue.error?.message}
        onRetry={refresh}
        emptyTitle={
          filtered ? 'No queue entries match' : isToday ? 'The queue is empty' : 'Nobody was queued on this day'
        }
        emptyDescription={
          filtered
            ? 'Try a different search or clear the filters.'
            : isToday
              ? 'Patients appear here as soon as their visit is registered.'
              : 'Pick another date to see its queue.'
        }
      />

      {queue.meta && queue.meta.total > 0 && (
        <Pagination meta={queue.meta} disabled={queue.status === 'loading'} onPageChange={setPage} />
      )}

      {reopening && (
        <ConfirmDialog
          title="Reopen this patient?"
          message={`${reopening.patient.name} will go back to waiting in today's queue for ${reopening.doctor.name}.`}
          confirmLabel="Reopen"
          pendingLabel="Reopening…"
          onConfirm={async () => {
            await queueService.setStatus(reopening.id, 'waiting')
            setReopening(null)
            refresh()
          }}
          onClose={() => setReopening(null)}
        />
      )}
    </div>
  )
}
