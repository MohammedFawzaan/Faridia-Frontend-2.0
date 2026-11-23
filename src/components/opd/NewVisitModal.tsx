import { CircleCheck, Printer } from 'lucide-react'
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Loaders'
import { Modal } from '@/components/ui/Modal'
import { SelectField } from '@/components/ui/SelectField'
import { ErrorState } from '@/components/ui/StateMessage'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useResource } from '@/hooks/useResource'
import { visitSchema, type VisitValues } from '@/schemas/visit'
import { toApiError, type ApiError } from '@/services/apiError'
import { departmentsService } from '@/services/departmentsService'
import { doctorsService } from '@/services/doctorsService'
import { symptomsService } from '@/services/symptomsService'
import { paymentMethodsService } from '@/services/paymentMethodsService'
import { visitsService } from '@/services/visitsService'
import type { FieldErrors } from '@/types/api'
import type { Visit } from '@/types/opd'
import type { TodayQueue } from '@/types/patient'
import { validate } from '@/utils/forms'
import { formatMoney } from '@/utils/money'
import { SymptomPicker } from './SymptomPicker'

const MAX_SYMPTOMS_LENGTH = 1000

interface NewVisitModalProps {
  patient: { patientId: string; name: string; todayQueue?: TodayQueue | null }
  onClose: () => void
  onCreated: (visit: Visit) => void
}

export function NewVisitModal({ patient, onClose, onCreated }: NewVisitModalProps) {
  const online = useOnlineStatus()
  const departments = useResource(departmentsService.list, 'OPD')
  const doctors = useResource(doctorsService.list, undefined)
  const paymentMethods = useResource(paymentMethodsService.list, undefined)
  const symptomList = useResource(symptomsService.list, undefined)
  const [pickedSymptoms, setPickedSymptoms] = useState<string[]>([])
  const [values, setValues] = useState<VisitValues>({
    departmentId: '',
    doctorId: '',
    paymentMethodId: '',
    symptoms: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [failure, setFailure] = useState<ApiError | null>(null)
  const [pending, setPending] = useState(false)
  const [created, setCreated] = useState<Visit | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [idempotencyKey] = useState(() => crypto.randomUUID())

  const departmentOptions = useMemo(
    () => (departments.data ?? []).map((department) => ({ value: String(department.id), label: department.name })),
    [departments.data],
  )
  const paymentOptions = useMemo(
    () => (paymentMethods.data ?? []).map((method) => ({ value: String(method.id), label: method.name })),
    [paymentMethods.data],
  )
  const availableDoctors = useMemo(
    () =>
      (doctors.data ?? []).filter(
        (doctor) => doctor.departmentId === null || String(doctor.departmentId) === values.departmentId,
      ),
    [doctors.data, values.departmentId],
  )
  const doctorOptions = availableDoctors.map((doctor) => ({ value: String(doctor.id), label: doctor.name }))
  const chosenDoctor = availableDoctors.find((doctor) => String(doctor.id) === values.doctorId)

  const handleChange = (field: keyof VisitValues) => (event: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = event.target.value
    setValues((current) => ({ ...current, [field]: value, ...(field === 'departmentId' ? { doctorId: '' } : {}) }))
    setErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
    setFailure(null)
  }

  const toggleSymptom = (name: string) => {
    setPickedSymptoms((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    )
    setErrors((current) => ({ ...current, symptoms: '' }))
  }

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    const result = validate(visitSchema, values)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    const symptoms = [...pickedSymptoms, result.values.symptoms].filter(Boolean).join(', ')
    if (symptoms.length > MAX_SYMPTOMS_LENGTH) {
      setErrors({ symptoms: `Symptoms must be at most ${MAX_SYMPTOMS_LENGTH} characters` })
      return
    }
    if (patient.todayQueue && !confirming) {
      setConfirming(true)
      return
    }
    setConfirming(false)
    setPending(true)
    try {
      setCreated(
        await visitsService.create(
          {
            patientId: patient.patientId,
            departmentId: Number(result.values.departmentId),
            doctorId: Number(result.values.doctorId),
            paymentMethodId: Number(result.values.paymentMethodId),
            symptoms: symptoms || undefined,
          },
          idempotencyKey,
        ),
      )
    } catch (error) {
      const apiError = toApiError(error)
      setErrors(apiError.fieldErrors)
      setFailure(Object.keys(apiError.fieldErrors).length ? null : apiError)
    } finally {
      setPending(false)
    }
  }

  const handleClose = () => (created ? onCreated(created) : onClose())
  const lookupFailed = departments.status === 'error' || doctors.status === 'error' || paymentMethods.status === 'error'
  const lookupLoading =
    departments.status === 'loading' || doctors.status === 'loading' || paymentMethods.status === 'loading'

  const queuedText = patient.todayQueue
    ? `Token ${patient.todayQueue.sl} with ${patient.todayQueue.doctorName} (${patient.todayQueue.status})`
    : ''

  if (confirming && patient.todayQueue) {
    return (
      <Modal title="Register another visit?" onClose={() => setConfirming(false)} busy={pending}>
        <Alert kind="warning" title="This patient is already in today's queue">
          {queuedText}. Another visit creates a second token and a second bill
          {chosenDoctor ? ` of ${formatMoney(chosenDoctor.consultationFee)}` : ''}.
        </Alert>
        <div className="modal-action">
          <Button variant="ghost" onClick={() => setConfirming(false)} disabled={pending}>
            Go back
          </Button>
          <Button onClick={() => handleSubmit()} loading={pending} loadingText="Registering…">
            Yes, register another visit
          </Button>
        </div>
      </Modal>
    )
  }

  if (created) {
    return (
      <Modal title="Visit registered" onClose={handleClose}>
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-success/15 text-success">
            <CircleCheck className="size-8" aria-hidden="true" />
          </span>
          <p className="font-medium">
            <span className="font-semibold text-secondary">{patient.name}</span> is in the queue of{' '}
            {created.doctor.name}.
          </p>
          <dl className="grid w-full grid-cols-3 gap-2">
            <div>
              <dt className="text-sm font-semibold">Token</dt>
              <dd className="font-heading text-2xl font-semibold text-secondary">{created.queue?.sl}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Bill no.</dt>
              <dd className="font-heading text-2xl font-semibold text-secondary">{created.bill?.number}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Fee</dt>
              <dd className="font-heading text-2xl font-semibold text-secondary">
                {created.bill ? formatMoney(created.bill.total) : '—'}
              </dd>
            </div>
          </dl>
        </div>
        <div className="modal-action">
          <Button variant="ghost" onClick={handleClose}>
            Done
          </Button>
          {created.bill && (
            <Link to={`/bills/${created.bill.id}/print`} className="btn btn-primary">
              <Printer className="size-4" aria-hidden="true" />
              Print bill
            </Link>
          )}
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="New OPD visit" onClose={onClose} busy={pending}>
      <p className="mb-4 font-medium">
        Registering a visit for <span className="font-semibold text-secondary">{patient.name}</span> (
        {patient.patientId}). The visit stays valid for 2 days, the patient joins today&apos;s queue and the
        doctor&apos;s fee is billed.
      </p>
      {lookupFailed ? (
        <ErrorState
          description={
            departments.error?.message ??
            doctors.error?.message ??
            paymentMethods.error?.message ??
            'The departments, doctors and payment methods could not be loaded.'
          }
          onRetry={() => {
            departments.reload()
            doctors.reload()
            paymentMethods.reload()
          }}
        />
      ) : lookupLoading ? (
        <Spinner message="Loading departments and doctors…" />
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {patient.todayQueue && (
            <Alert kind="warning" title="Already in today's queue">
              {queuedText}. You will be asked to confirm before a second visit is registered.
            </Alert>
          )}
          {failure && (
            <Alert kind="error" title="Could not register the visit">
              {failure.message}
            </Alert>
          )}
          <SelectField
            label="Department"
            name="departmentId"
            placeholder="Choose a department"
            options={departmentOptions}
            value={values.departmentId}
            onChange={handleChange('departmentId')}
            error={errors.departmentId}
            disabled={pending}
            required
          />
          <SelectField
            label="Doctor"
            name="doctorId"
            placeholder={values.departmentId ? 'Choose a doctor' : 'Choose a department first'}
            options={doctorOptions}
            value={values.doctorId}
            onChange={handleChange('doctorId')}
            error={errors.doctorId}
            disabled={pending || !values.departmentId}
            required
          />
          <SelectField
            label="Payment method"
            name="paymentMethodId"
            placeholder="Choose how the fee is paid"
            options={paymentOptions}
            value={values.paymentMethodId}
            onChange={handleChange('paymentMethodId')}
            error={errors.paymentMethodId}
            disabled={pending}
            required
          />
          {chosenDoctor && (
            <p className="rounded-box bg-primary/10 px-3 py-2 font-medium" aria-live="polite">
              Registration fee:{' '}
              <span className="font-semibold text-secondary">{formatMoney(chosenDoctor.consultationFee)}</span>
            </p>
          )}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-semibold">Symptoms (optional)</legend>
            {symptomList.status === 'error' ? (
              <p className="text-sm font-medium">
                The symptom list could not be loaded. Type the symptoms below instead.
              </p>
            ) : symptomList.status === 'loading' ? (
              <Spinner message="Loading symptoms…" />
            ) : (
              <SymptomPicker
                options={symptomList.data ?? []}
                selected={pickedSymptoms}
                onToggle={toggleSymptom}
                disabled={pending}
              />
            )}
          </fieldset>
          <TextAreaField
            label="Other symptoms"
            name="symptoms"
            placeholder="Anything not in the list (optional)"
            value={values.symptoms}
            onChange={handleChange('symptoms')}
            error={errors.symptoms}
            disabled={pending}
          />
          {!online && (
            <p className="text-sm font-medium text-error">
              You are offline. Connect to the internet to register the visit.
            </p>
          )}
          <div className="modal-action">
            <Button variant="ghost" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" loading={pending} loadingText="Registering…" disabled={!online}>
              Register visit
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
