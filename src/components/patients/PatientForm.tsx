import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/CheckboxField'
import { SelectField } from '@/components/ui/SelectField'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { TextField } from '@/components/ui/TextField'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { patientSchema, type PatientValues } from '@/schemas/patient'
import { toApiError, type ApiError } from '@/services/apiError'
import { patientsService } from '@/services/patientsService'
import type { FieldErrors } from '@/types/api'
import type { Patient } from '@/types/patient'
import { validate } from '@/utils/forms'
import { GENDER_LABELS } from '@/utils/patient'

interface PatientFormProps {
  patient?: Patient
  initialMobile?: string
  onSaved: (patient: Patient) => void
  onCancel: () => void
}

type FormValues = Omit<PatientValues, 'gender'> & { gender: PatientValues['gender'] | '' }

const GENDER_OPTIONS = Object.entries(GENDER_LABELS).map(([value, label]) => ({ value, label }))
const today = () => new Date().toISOString().slice(0, 10)

const initialValues = (patient: Patient | undefined, initialMobile: string): FormValues => ({
  name: patient?.name ?? '',
  fatherName: patient?.fatherName ?? '',
  dob: patient?.dob?.slice(0, 10) ?? '',
  gender: patient?.gender ?? '',
  address: patient?.address ?? '',
  city: patient?.city ?? '',
  pinCode: patient?.pinCode ?? '',
  mobile: patient?.mobile ?? initialMobile,
  isWhatsapp: patient?.isWhatsapp ?? true,
  whatsappNumber: patient?.whatsappNumber ?? '',
  lgNumber: patient?.lgNumber ?? '',
  isFree: patient?.isFree ?? false,
})

export function PatientForm({ patient, initialMobile = '', onSaved, onCancel }: PatientFormProps) {
  const online = useOnlineStatus()
  const [values, setValues] = useState<FormValues>(() => initialValues(patient, initialMobile))
  const [errors, setErrors] = useState<FieldErrors>({})
  const [failure, setFailure] = useState<ApiError | null>(null)
  const [pending, setPending] = useState(false)

  const clearError = (field: string) => {
    setErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
    setFailure(null)
  }

  const handleText =
    (field: keyof FormValues, digitsOnly = false) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = digitsOnly ? event.target.value.replace(/\D/g, '') : event.target.value
      setValues((current) => ({ ...current, [field]: value }))
      clearError(field)
    }

  const handleCheckbox = (field: 'isWhatsapp' | 'isFree') => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.checked }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = validate(patientSchema, values)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    const { whatsappNumber, lgNumber, ...rest } = result.values
    const payload = { ...rest, whatsappNumber: whatsappNumber || null, lgNumber: lgNumber || null }
    setPending(true)
    try {
      onSaved(
        patient ? await patientsService.update(patient.patientId, payload) : await patientsService.create(payload),
      )
    } catch (error) {
      const apiError = toApiError(error)
      const fieldErrors = { ...apiError.fieldErrors }
      if (apiError.code === 'DOB_IN_FUTURE') fieldErrors.dob = apiError.message
      setErrors(fieldErrors)
      setFailure(apiError.code === 'DOB_IN_FUTURE' ? null : apiError)
      setPending(false)
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      {failure && (
        <Alert kind="error" title="Could not save the patient">
          {failure.message}
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TextField
          label="Full name"
          name="name"
          value={values.name}
          onChange={handleText('name')}
          error={errors.name}
          disabled={pending}
          required
          autoFocus
        />
        <TextField
          label="Father's name"
          name="fatherName"
          value={values.fatherName}
          onChange={handleText('fatherName')}
          error={errors.fatherName}
          disabled={pending}
          required
        />
        <TextField
          label="Date of birth"
          name="dob"
          type="date"
          max={today()}
          value={values.dob}
          onChange={handleText('dob')}
          error={errors.dob}
          disabled={pending}
          required
        />
        <SelectField
          label="Gender"
          name="gender"
          placeholder="Choose a gender"
          options={GENDER_OPTIONS}
          value={values.gender}
          onChange={handleText('gender')}
          error={errors.gender}
          disabled={pending}
          required
        />
        <TextField
          label="Mobile number"
          name="mobile"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit mobile number"
          value={values.mobile}
          onChange={handleText('mobile', true)}
          error={errors.mobile}
          disabled={pending}
          required
        />
        <TextField
          label="LG number"
          name="lgNumber"
          maxLength={15}
          value={values.lgNumber}
          onChange={handleText('lgNumber')}
          error={errors.lgNumber}
          disabled={pending}
        />
      </div>
      <TextAreaField
        label="Address"
        name="address"
        value={values.address}
        onChange={handleText('address')}
        error={errors.address}
        disabled={pending}
        required
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TextField
          label="City"
          name="city"
          value={values.city}
          onChange={handleText('city')}
          error={errors.city}
          disabled={pending}
          required
        />
        <TextField
          label="Pin code"
          name="pinCode"
          inputMode="numeric"
          maxLength={6}
          value={values.pinCode}
          onChange={handleText('pinCode', true)}
          error={errors.pinCode}
          disabled={pending}
          required
        />
        <TextField
          label="WhatsApp number (if different)"
          name="whatsappNumber"
          type="tel"
          inputMode="numeric"
          maxLength={15}
          value={values.whatsappNumber}
          onChange={handleText('whatsappNumber', true)}
          error={errors.whatsappNumber}
          disabled={pending}
        />
      </div>
      <div className="flex flex-wrap gap-6">
        <CheckboxField
          label="Mobile number is on WhatsApp"
          checked={values.isWhatsapp}
          onChange={handleCheckbox('isWhatsapp')}
          disabled={pending}
        />
        <CheckboxField
          label="Free patient"
          checked={values.isFree}
          onChange={handleCheckbox('isFree')}
          disabled={pending}
        />
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" loading={pending} loadingText="Saving…" disabled={!online}>
          {patient ? 'Save changes' : 'Register patient'}
        </Button>
      </div>
      {!online && (
        <p className="text-center text-sm font-medium text-error">You are offline. Connect to the internet to save.</p>
      )}
    </form>
  )
}
