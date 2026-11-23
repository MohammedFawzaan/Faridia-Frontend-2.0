import { Pencil, Search, Stethoscope, UserPlus } from 'lucide-react'
import { useMemo, useState, type ChangeEvent } from 'react'
import { DoctorFormModal } from '@/components/doctors/DoctorFormModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagedQuery } from '@/hooks/usePagedQuery'
import { useResource } from '@/hooks/useResource'
import { departmentsService } from '@/services/departmentsService'
import { doctorsService } from '@/services/doctorsService'
import { toast } from '@/stores/toastStore'
import type { SortOrder } from '@/types/api'
import type { DoctorAdmin, DoctorListQuery, DoctorSortField } from '@/types/doctor'
import { formatMoney } from '@/utils/money'

type Dialog = { type: 'create' } | { type: 'edit'; doctor: DoctorAdmin } | null

const PAGE_SIZE = 10
const STATUS_FILTER = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function DoctorsPage() {
  const [searchText, setSearchText] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive' | ''>('')
  const [sortBy, setSortBy] = useState<DoctorSortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState<Dialog>(null)

  const search = useDebounce(searchText.trim(), 500)
  const departments = useResource(departmentsService.list, undefined)
  const query = useMemo<DoctorListQuery>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
      isActive: status ? status === 'active' : undefined,
      sortBy,
      sortOrder,
    }),
    [page, search, departmentId, status, sortBy, sortOrder],
  )
  const { items, meta, status: queryStatus, error, reload } = usePagedQuery(doctorsService.listManage, query)
  const filtered = Boolean(search || departmentId || status)

  const handleSort = (sortKey: string) => {
    if (sortKey === sortBy) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(sortKey as DoctorSortField)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const handleFilter =
    <T,>(setter: (value: T) => void) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      setter(event.target.value as T)
      setPage(1)
    }

  const finish = (message: string) => {
    setDialog(null)
    toast.success(message)
    reload()
  }

  const columns: Column<DoctorAdmin>[] = [
    {
      key: 'name',
      header: 'Doctor',
      sortKey: 'name',
      render: (doctor) => (
        <div>
          <p className="font-semibold text-secondary">{doctor.name}</p>
          <p className="text-sm">{[doctor.graduation, doctor.postGraduation].filter(Boolean).join(', ')}</p>
          <p className="text-sm sm:hidden">
            {doctor.departmentName ?? 'No department'} · {formatMoney(doctor.consultationFee)}
          </p>
        </div>
      ),
    },
    { key: 'department', header: 'Department', mobileHidden: true, render: (doctor) => doctor.departmentName ?? '—' },
    {
      key: 'fee',
      header: 'Fee',
      sortKey: 'consultationFee',
      mobileHidden: true,
      render: (doctor) => formatMoney(doctor.consultationFee),
    },
    {
      key: 'status',
      header: 'Status',
      render: (doctor) => (
        <span className={`badge font-semibold ${doctor.isActive ? 'badge-success' : 'badge-error'}`}>
          {doctor.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (doctor) => (
        <Button
          variant="outline"
          className="btn-sm"
          onClick={() => setDialog({ type: 'edit', doctor })}
          aria-label={`Edit ${doctor.name}`}
        >
          <Pencil className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
      ),
    },
  ]

  const departmentOptions = (departments.data ?? []).map((department) => ({
    value: String(department.id),
    label: `${department.name} (${department.type})`,
  }))

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={Stethoscope}
        title="Doctors"
        description="Add and edit the doctors patients are registered with."
        actions={
          <Button onClick={() => setDialog({ type: 'create' })} disabled={departments.status !== 'success'}>
            <UserPlus className="size-5" aria-hidden="true" />
            Add doctor
          </Button>
        }
      />

      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            label="Search"
            type="search"
            leading={<Search className="size-4" />}
            placeholder="Doctor name"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value)
              setPage(1)
            }}
            hint={searchText.trim() !== search ? 'Searching…' : undefined}
          />
          <SelectField
            label="Department"
            placeholder="All departments"
            options={departmentOptions}
            value={departmentId}
            onChange={handleFilter(setDepartmentId)}
          />
          <SelectField
            label="Status"
            placeholder="All"
            options={STATUS_FILTER}
            value={status}
            onChange={handleFilter(setStatus)}
          />
        </div>
      </Card>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(doctor) => doctor.id}
        status={queryStatus}
        errorMessage={error?.message}
        onRetry={reload}
        emptyTitle={filtered ? 'No doctors match your search' : 'No doctors yet'}
        emptyDescription={
          filtered ? 'Try a different search or clear the filters.' : 'Add the first doctor to get started.'
        }
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {meta && meta.total > 0 && <Pagination meta={meta} disabled={queryStatus === 'loading'} onPageChange={setPage} />}

      {dialog && (
        <DoctorFormModal
          doctor={dialog.type === 'edit' ? dialog.doctor : undefined}
          departments={departments.data ?? []}
          onClose={() => setDialog(null)}
          onSaved={(doctor) =>
            finish(dialog.type === 'edit' ? `${doctor.name} was updated` : `${doctor.name} was added`)
          }
        />
      )}
    </div>
  )
}
