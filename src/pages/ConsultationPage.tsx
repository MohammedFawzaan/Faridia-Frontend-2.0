import { ClipboardPlus, Phone, Printer } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MedicineLines, type MedicineLineErrors, type MedicineLineValues } from '@/components/opd/MedicineLines'
import { SymptomPicker } from '@/components/opd/SymptomPicker'
import { PatientAvatar } from '@/components/patients/PatientAvatar'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Loaders'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState } from '@/components/ui/StateMessage'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useResource } from '@/hooks/useResource'
import { consultationSchema, MEDICINE_OTHER } from '@/schemas/consultation'
import { toApiError, type ApiError } from '@/services/apiError'
import { medicinesService } from '@/services/medicinesService'
import { queueService } from '@/services/queueService'
import { symptomsService } from '@/services/symptomsService'
import { toast } from '@/stores/toastStore'
import type { ConsultationMedicinePayload } from '@/types/opd'
import { formatTime } from '@/utils/date'
import { formatAge, GENDER_LABELS } from '@/utils/patient'

interface FormErrors {
  form?: string
  remarks?: string
  lines: Record<number, MedicineLineErrors>
}

const toPayload = (symptoms: string[], remarks: string, lines: MedicineLineValues[]) => ({
  symptoms,
  remarks: remarks.trim() || undefined,
  medicines: lines.map<ConsultationMedicinePayload>((line) =>
    line.medicineId === MEDICINE_OTHER
      ? { name: line.name.trim(), qty: Number(line.qty) }
      : { medicineId: Number(line.medicineId), qty: Number(line.qty) },
  ),
})

export default function ConsultationPage() {
  const { queueId = '' } = useParams()
  const navigate = useNavigate()
  const online = useOnlineStatus()
  const entry = useResource(queueService.get, queueId)
  const symptomList = useResource(symptomsService.list, undefined)
  const medicineList = useResource(medicinesService.list, undefined)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [lines, setLines] = useState<MedicineLineValues[]>([])
  const [remarks, setRemarks] = useState('')
  const [errors, setErrors] = useState<FormErrors>({ lines: {} })
  const [failure, setFailure] = useState<ApiError | null>(null)
  const [pending, setPending] = useState(false)
  const [idempotencyKey] = useState(() => crypto.randomUUID())

  const lookups = [entry, symptomList, medicineList]
  if (lookups.some((lookup) => lookup.status === 'loading')) return <Spinner message="Loading the consultation…" />
  const failed = lookups.find((lookup) => lookup.status === 'error')
  if (failed || !entry.data) {
    return (
      <ErrorState
        title="Could not open the consultation"
        description={failed?.error?.message ?? 'Please try again.'}
        action={
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                entry.reload()
                symptomList.reload()
                medicineList.reload()
              }}
            >
              Try again
            </button>
            <Link to="/queue" className="btn btn-outline btn-primary">
              Back to the queue
            </Link>
          </div>
        }
      />
    )
  }

  const { data: queueEntry } = entry
  const { patient } = queueEntry

  const clearFailure = () => {
    setFailure(null)
    setErrors({ lines: {} })
  }

  const toggleSymptom = (name: string) => {
    setSymptoms((current) => (current.includes(name) ? current.filter((item) => item !== name) : [...current, name]))
    clearFailure()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = consultationSchema.safeParse({
      symptoms,
      remarks,
      medicines: lines.map(({ medicineId, name, qty }) => ({ medicineId, name, qty })),
    })
    if (!result.success) {
      const next: FormErrors = { lines: {} }
      for (const issue of result.error.issues) {
        const [section, index, field] = issue.path
        if (section === 'medicines' && typeof index === 'number' && typeof field === 'string') {
          next.lines[index] = {
            ...next.lines[index],
            [field]: next.lines[index]?.[field as keyof MedicineLineErrors] ?? issue.message,
          }
        } else if (section === 'remarks') {
          next.remarks = next.remarks ?? issue.message
        } else {
          next.form = next.form ?? issue.message
        }
      }
      setErrors(next)
      return
    }
    setPending(true)
    try {
      const prescription = await queueService.consult(
        queueEntry.id,
        toPayload(symptoms, remarks, lines),
        idempotencyKey,
      )
      toast.success(`Consultation saved for ${patient.name}`)
      navigate(`/prescriptions/${prescription.id}/print`, { replace: true })
    } catch (error) {
      setFailure(toApiError(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={ClipboardPlus}
        title="Consultation"
        description="Record the symptoms and medicines, then save to finish this patient."
      />

      <section className="flex flex-wrap items-center gap-4 sm:rounded-box sm:border sm:border-base-300 sm:bg-base-100 sm:p-4 sm:shadow-sm">
        <PatientAvatar patient={patient} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl text-secondary">{patient.name}</h2>
          <p className="font-medium">
            {patient.patientId} · {formatAge(patient)} · {GENDER_LABELS[patient.gender]}
          </p>
          <p className="flex items-center gap-1 font-medium">
            <Phone className="size-4" aria-hidden="true" />
            {patient.mobile}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 text-center">
          <div>
            <dt className="text-sm font-semibold">Token</dt>
            <dd className="font-heading text-2xl font-semibold text-secondary">{queueEntry.sl}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold">Arrived</dt>
            <dd className="font-semibold">{formatTime(queueEntry.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold">Doctor</dt>
            <dd className="font-semibold">{queueEntry.doctor.name}</dd>
          </div>
        </dl>
      </section>

      {queueEntry.visitSymptoms && (
        <Alert kind="info" title="Noted at the front desk">
          {queueEntry.visitSymptoms}
        </Alert>
      )}

      {queueEntry.status === 'done' ? (
        <Alert kind="warning" title="This patient has already been seen">
          {queueEntry.prescriptionId ? (
            <Link
              to={`/prescriptions/${queueEntry.prescriptionId}/print`}
              className="link inline-flex items-center gap-1 font-semibold"
            >
              <Printer className="size-4" aria-hidden="true" />
              Open the prescription
            </Link>
          ) : (
            'The consultation is closed.'
          )}
        </Alert>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {(failure || errors.form) && (
            <Alert kind="error" title="Could not save the consultation">
              {errors.form ?? failure?.message}
            </Alert>
          )}
          <Card title="Symptoms">
            <SymptomPicker
              options={symptomList.data ?? []}
              selected={symptoms}
              onToggle={toggleSymptom}
              disabled={pending}
            />
          </Card>
          <Card title="Medicines">
            <MedicineLines
              medicines={medicineList.data ?? []}
              lines={lines}
              errors={errors.lines}
              onChange={(next) => {
                setLines(next)
                clearFailure()
              }}
              disabled={pending}
            />
          </Card>
          <Card title="Remarks">
            <TextAreaField
              label="Remarks"
              placeholder="Advice or notes for the patient (optional)"
              value={remarks}
              onChange={(event) => {
                setRemarks(event.target.value)
                clearFailure()
              }}
              error={errors.remarks}
              disabled={pending}
            />
          </Card>
          {!online && (
            <p className="text-sm font-medium text-error">
              You are offline. Connect to the internet to save the consultation.
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Link to="/queue" className="btn btn-ghost">
              Cancel
            </Link>
            <Button type="submit" loading={pending} loadingText="Saving…" disabled={!online}>
              Save consultation
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
