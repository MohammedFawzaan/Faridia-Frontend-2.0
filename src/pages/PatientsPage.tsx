import { Eye, Pencil, Search, Stethoscope, UserPlus, UsersRound } from 'lucide-react'
import { useMemo, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { NewVisitModal } from '@/components/opd/NewVisitModal'
import { PatientAvatar } from '@/components/patients/PatientAvatar'
import { QueuedBadge } from '@/components/patients/QueuedBadge'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagedQuery } from '@/hooks/usePagedQuery'
import { patientsService } from '@/services/patientsService'
import type { SortOrder } from '@/types/api'
import type { Gender, Patient, PatientListQuery, PatientSortField } from '@/types/patient'
import { formatAge, GENDER_LABELS } from '@/utils/patient'

const PAGE_SIZE = 10
const GENDER_FILTER = Object.entries(GENDER_LABELS).map(([value, label]) => ({ value, label }))
const TYPE_FILTER = [
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
]

export default function PatientsPage() {
  const [searchText, setSearchText] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [type, setType] = useState<'free' | 'paid' | ''>('')
  const [sortBy, setSortBy] = useState<PatientSortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [page, setPage] = useState(1)
  const [visitPatient, setVisitPatient] = useState<Patient | null>(null)

  const search = useDebounce(searchText.trim(), 500)
  const query = useMemo<PatientListQuery>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      gender: gender || undefined,
      isFree: type ? type === 'free' : undefined,
      sortBy,
      sortOrder,
    }),
    [page, search, gender, type, sortBy, sortOrder],
  )
  const { items, meta, status, error, reload } = usePagedQuery(patientsService.list, query)
  const filtered = Boolean(search || gender || type)

  const handleSort = (sortKey: string) => {
    if (sortKey === sortBy) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(sortKey as PatientSortField)
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

  const columns: Column<Patient>[] = [
    {
      key: 'name',
      header: 'Patient',
      sortKey: 'name',
      render: (patient) => (
        <div className="flex items-center gap-3">
          <PatientAvatar patient={patient} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-secondary">{patient.name}</p>
            {patient.todayQueue && <QueuedBadge todayQueue={patient.todayQueue} className="my-1" />}
            {patient.fatherName && <p className="text-sm">S/o {patient.fatherName}</p>}
            <p className="text-sm sm:hidden">
              {patient.patientId} · {patient.mobile}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'patientId',
      header: 'Patient id',
      sortKey: 'patientId',
      mobileHidden: true,
      render: (patient) => <span className="badge badge-outline font-semibold">{patient.patientId}</span>,
    },
    {
      key: 'age',
      header: 'Age / gender',
      mobileHidden: true,
      render: (patient) => `${formatAge(patient)} · ${GENDER_LABELS[patient.gender]}`,
    },
    { key: 'mobile', header: 'Mobile', mobileHidden: true, render: (patient) => patient.mobile },
    { key: 'city', header: 'City', mobileHidden: true, render: (patient) => patient.city ?? '—' },
    {
      key: 'type',
      header: 'Type',
      mobileHidden: true,
      render: (patient) =>
        patient.isFree ? (
          <span className="badge badge-accent font-semibold">Free</span>
        ) : (
          <span className="badge badge-outline font-semibold">Paid</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (patient) => (
        <div className="flex gap-1">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setVisitPatient(patient)}
            aria-label={`New visit for ${patient.name}`}
          >
            <Stethoscope className="size-4" aria-hidden="true" />
            <span className="hidden lg:inline">New visit</span>
          </button>
          <Link
            to={`/patients/${patient.patientId}`}
            className="btn btn-outline btn-primary btn-sm"
            aria-label={`View ${patient.name}`}
          >
            <Eye className="size-4" aria-hidden="true" />
            <span className="hidden lg:inline">View</span>
          </Link>
          <Link
            to={`/patients/${patient.patientId}/edit`}
            className="btn btn-outline btn-primary btn-sm"
            aria-label={`Edit ${patient.name}`}
          >
            <Pencil className="size-4" aria-hidden="true" />
            <span className="hidden lg:inline">Edit</span>
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={UsersRound}
        title="Patients"
        description="Find, register and update patients."
        actions={
          <Link to="/patients/new" className="btn btn-primary">
            <UserPlus className="size-5" aria-hidden="true" />
            Add patient
          </Link>
        }
      />

      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <TextField
              label="Search"
              type="search"
              leading={<Search className="size-4" />}
              placeholder="Name, mobile number or patient id"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value)
                setPage(1)
              }}
              hint={searchText.trim() !== search ? 'Searching…' : undefined}
            />
          </div>
          <SelectField
            label="Gender"
            placeholder="All"
            options={GENDER_FILTER}
            value={gender}
            onChange={handleFilter(setGender)}
          />
          <SelectField
            label="Type"
            placeholder="All"
            options={TYPE_FILTER}
            value={type}
            onChange={handleFilter(setType)}
          />
        </div>
      </Card>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(patient) => patient.patientId}
        status={status}
        errorMessage={error?.message}
        onRetry={reload}
        emptyTitle={filtered ? 'No patients match your search' : 'No patients yet'}
        emptyDescription={
          filtered ? 'Try a different search or clear the filters.' : 'Register the first patient to get started.'
        }
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {meta && meta.total > 0 && <Pagination meta={meta} disabled={status === 'loading'} onPageChange={setPage} />}

      {visitPatient && (
        <NewVisitModal
          patient={visitPatient}
          onClose={() => setVisitPatient(null)}
          onCreated={() => {
            setVisitPatient(null)
            reload()
          }}
        />
      )}
    </div>
  )
}
