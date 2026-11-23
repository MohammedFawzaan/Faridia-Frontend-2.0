import { ArrowLeft, BedDouble, MapPin, Pencil, Phone, Siren, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { NewVisitModal } from '@/components/opd/NewVisitModal'
import { VisitList } from '@/components/opd/VisitList'
import { PatientAvatar } from '@/components/patients/PatientAvatar'
import { QueuedBadge } from '@/components/patients/QueuedBadge'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Loaders'
import { EmptyState, ErrorState } from '@/components/ui/StateMessage'
import { Tabs } from '@/components/ui/Tabs'
import { useResource } from '@/hooks/useResource'
import { patientsService } from '@/services/patientsService'
import { formatAge, formatDate, GENDER_LABELS } from '@/utils/patient'

type HistoryTab = 'opd' | 'ipd' | 'emergency'

const TABS = [
  { value: 'opd' as const, label: 'OPD', icon: Stethoscope },
  { value: 'ipd' as const, label: 'IPD', icon: BedDouble },
  { value: 'emergency' as const, label: 'Emergency', icon: Siren },
]

const EMPTY_TEXT = {
  ipd: { icon: BedDouble, title: 'No IPD admissions yet', subject: 'IPD admissions' },
  emergency: { icon: Siren, title: 'No emergency visits yet', subject: 'Emergency visits' },
}

const bannerButton = 'btn btn-sm border-white bg-white text-secondary hover:bg-base-200'
const bannerOutlineButton =
  'btn btn-outline btn-sm border-white text-white hover:border-white hover:bg-white hover:text-secondary'

export default function PatientViewPage() {
  const { patientId = '' } = useParams()
  const [tab, setTab] = useState<HistoryTab>('opd')
  const [showVisit, setShowVisit] = useState(false)
  const [visitVersion, setVisitVersion] = useState(0)
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
    ["Father's name", patient.fatherName ?? '—'],
    ['Date of birth', formatDate(patient.dob)],
    ['WhatsApp', patient.whatsappNumber ?? (patient.isWhatsapp ? 'Same as mobile' : 'No')],
    ['Address', patient.address],
    ['Pin code', patient.pinCode ?? '—'],
    ['LG number', patient.lgNumber ?? '—'],
    ['Registered', formatDate(patient.createdAt)],
  ]
  const empty = tab === 'opd' ? null : EMPTY_TEXT[tab]

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-brand -mx-3 -mt-4 px-4 py-6 text-white sm:mx-0 sm:mt-0 sm:rounded-box sm:p-6 sm:shadow-md">
        <div className="flex flex-wrap items-center gap-4">
          <PatientAvatar patient={patient} size="lg" className="[&>span]:ring-white/60" />
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl sm:text-3xl">
              {patient.name}
              {patient.isFree && (
                <span className="badge border-0 bg-accent font-semibold text-accent-content">Free</span>
              )}
            </h1>
            <p className="font-medium">{patient.patientId}</p>
            {patient.todayQueue && <QueuedBadge todayQueue={patient.todayQueue} className="mt-1" />}
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
              <li>
                {formatAge(patient)} · {GENDER_LABELS[patient.gender]}
              </li>
              <li className="flex items-center gap-1">
                <Phone className="size-4" aria-hidden="true" />
                {patient.mobile}
              </li>
              {patient.city && (
                <li className="flex items-center gap-1">
                  <MapPin className="size-4" aria-hidden="true" />
                  {patient.city}
                </li>
              )}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/patients" className={bannerOutlineButton}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Link>
            <Link to={`/patients/${patient.patientId}/edit`} className={bannerOutlineButton}>
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Link>
            <button type="button" className={bannerButton} onClick={() => setShowVisit(true)}>
              <Stethoscope className="size-4" aria-hidden="true" />
              New visit
            </button>
          </div>
        </div>
      </section>

      <Card title="Patient details">
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {details.map(([label, value]) => (
            <div key={label} className="border-b border-base-300 pb-2">
              <dt className="text-sm font-semibold text-secondary">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          {empty ? (
            <EmptyState
              icon={empty.icon}
              title={empty.title}
              description={`${empty.subject} will appear here once this module is available in Faridia 2.0.`}
            />
          ) : (
            <VisitList key={visitVersion} patientId={patient.patientId} />
          )}
        </div>
      </Card>

      {showVisit && (
        <NewVisitModal
          patient={patient}
          onClose={() => setShowVisit(false)}
          onCreated={() => {
            setShowVisit(false)
            setTab('opd')
            setVisitVersion((version) => version + 1)
            reload()
          }}
        />
      )}
    </div>
  )
}
