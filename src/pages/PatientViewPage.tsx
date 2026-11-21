import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Spinner } from '@/components/ui/Loaders'
import { EmptyState, ErrorState } from '@/components/ui/StateMessage'
import { Tabs } from '@/components/ui/Tabs'
import { useResource } from '@/hooks/useResource'
import { patientsService } from '@/services/patientsService'
import { formatAge, formatDate, GENDER_LABELS } from '@/utils/patient'

type HistoryTab = 'opd' | 'ipd' | 'emergency'

const TABS: { value: HistoryTab; label: string }[] = [
  { value: 'opd', label: 'OPD' },
  { value: 'ipd', label: 'IPD' },
  { value: 'emergency', label: 'Emergency' },
]

const EMPTY_TEXT: Record<HistoryTab, { title: string; subject: string }> = {
  opd: { title: 'No OPD visits yet', subject: 'OPD visits' },
  ipd: { title: 'No IPD admissions yet', subject: 'IPD admissions' },
  emergency: { title: 'No emergency visits yet', subject: 'Emergency visits' },
}

export default function PatientViewPage() {
  const { patientId = '' } = useParams()
  const [tab, setTab] = useState<HistoryTab>('opd')
  const { data: patient, status, error, reload } = useResource(patientsService.get, patientId)

  if (status === 'loading') return <Spinner message="Loading patient…" />
  if (status === 'error' || !patient) {
    return (
      <ErrorState
        title="Could not load the patient"
        description={error?.message ?? 'Please try again.'}
        action={
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" onClick={reload}>
              Try again
            </button>
            <Link to="/patients" className="btn btn-outline btn-primary">
              Back to patients
            </Link>
          </div>
        }
      />
    )
  }

  const details: [string, string][] = [
    ['Patient id', patient.patientId],
    ["Father's name", patient.fatherName ?? '—'],
    ['Age', formatAge(patient)],
    ['Date of birth', formatDate(patient.dob)],
    ['Gender', GENDER_LABELS[patient.gender]],
    ['Mobile', patient.mobile],
    ['WhatsApp', patient.whatsappNumber ?? (patient.isWhatsapp ? 'Same as mobile' : 'No')],
    ['Address', patient.address],
    ['City', patient.city ?? '—'],
    ['Pin code', patient.pinCode ?? '—'],
    ['LG number', patient.lgNumber ?? '—'],
    ['Registered', formatDate(patient.createdAt)],
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex flex-wrap items-center gap-2 text-3xl text-secondary">
            {patient.name}
            {patient.isFree && <span className="badge badge-accent">Free</span>}
          </h1>
          <p className="mt-1 font-medium">
            {patient.patientId} · {formatAge(patient)} · {GENDER_LABELS[patient.gender]}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/patients" className="btn btn-outline btn-primary">
            Back
          </Link>
          <Link to={`/patients/${patient.patientId}/edit`} className="btn btn-primary">
            Edit
          </Link>
        </div>
      </div>

      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {details.map(([label, value]) => (
          <div key={label} className="border-b border-base-300 pb-2">
            <dt className="text-sm font-semibold">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-2">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        <EmptyState title={EMPTY_TEXT[tab].title} description={`${EMPTY_TEXT[tab].subject} will appear here once this module is available in Faridia 2.0.`} />
      </div>
    </div>
  )
}
