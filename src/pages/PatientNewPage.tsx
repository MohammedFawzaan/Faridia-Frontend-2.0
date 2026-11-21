import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PatientForm } from '@/components/patients/PatientForm'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { mobileSchema } from '@/schemas/patient'
import { toApiError } from '@/services/apiError'
import { patientsService } from '@/services/patientsService'
import { toast } from '@/stores/toastStore'
import type { Patient } from '@/types/patient'
import { validate } from '@/utils/forms'
import { formatAge, GENDER_LABELS } from '@/utils/patient'

export default function PatientNewPage() {
  const navigate = useNavigate()
  const online = useOnlineStatus()
  const [mobile, setMobile] = useState('')
  const [mobileError, setMobileError] = useState<string>()
  const [failure, setFailure] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [matches, setMatches] = useState<Patient[] | null>(null)
  const [registering, setRegistering] = useState(false)

  const handleCheck = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = validate(mobileSchema, { mobile })
    if (!result.ok) {
      setMobileError(result.errors.mobile)
      return
    }
    setPending(true)
    setFailure(null)
    try {
      const page = await patientsService.list({ page: 1, limit: 20, mobile, sortBy: 'createdAt', sortOrder: 'desc' })
      setMatches(page.items)
      setRegistering(page.items.length === 0)
    } catch (error) {
      setFailure(toApiError(error).message)
    } finally {
      setPending(false)
    }
  }

  const resetCheck = () => {
    setMatches(null)
    setRegistering(false)
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-3xl text-secondary">Add patient</h1>
        <p className="mt-1 font-medium">Check the mobile number first to avoid registering the same patient twice.</p>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleCheck} noValidate>
        <div className="sm:w-72">
          <TextField
            label="Mobile number"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit mobile number"
            value={mobile}
            onChange={(event) => {
              setMobile(event.target.value.replace(/\D/g, ''))
              setMobileError(undefined)
              resetCheck()
            }}
            error={mobileError}
            disabled={pending}
            autoFocus
          />
        </div>
        <Button type="submit" loading={pending} loadingText="Checking…" disabled={!online}>
          Check number
        </Button>
      </form>
      {!online && <p className="text-sm font-medium text-error">You are offline. Connect to the internet to check the number.</p>}
      {failure && (
        <Alert kind="error" title="Could not check the number">
          {failure}
        </Alert>
      )}

      {matches && matches.length > 0 && (
        <section className="flex flex-col gap-3">
          <Alert kind="warning" title={`${matches.length} existing ${matches.length === 1 ? 'patient uses' : 'patients use'} this number`}>
            Open an existing patient if it is the same person.
          </Alert>
          <ul className="divide-y divide-base-300 border-y border-base-300">
            {matches.map((patient) => (
              <li key={patient.patientId} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-semibold">
                    {patient.name} <span className="font-normal">({patient.patientId})</span>
                  </p>
                  <p className="text-sm">
                    {formatAge(patient)} · {GENDER_LABELS[patient.gender]}
                    {patient.city ? ` · ${patient.city}` : ''}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Link to={`/patients/${patient.patientId}`} className="btn btn-outline btn-primary btn-sm">
                    View
                  </Link>
                  <Link to={`/patients/${patient.patientId}/edit`} className="btn btn-outline btn-primary btn-sm">
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          {!registering && (
            <div>
              <Button variant="outline" onClick={() => setRegistering(true)}>
                Register a new patient with this number
              </Button>
            </div>
          )}
        </section>
      )}

      {matches && matches.length === 0 && <Alert kind="success">No patient uses this number. Fill in the details to register.</Alert>}

      {registering && (
        <section className="flex flex-col gap-3 border-t border-base-300 pt-4">
          <h2 className="text-2xl text-secondary">Patient details</h2>
          <PatientForm
            initialMobile={mobile}
            onCancel={() => navigate('/patients')}
            onSaved={(patient) => {
              toast.success(`${patient.name} was registered as ${patient.patientId}`)
              navigate(`/patients/${patient.patientId}`)
            }}
          />
        </section>
      )}
    </div>
  )
}
