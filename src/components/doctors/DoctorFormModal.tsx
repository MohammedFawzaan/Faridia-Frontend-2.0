import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/CheckboxField'
import { Modal } from '@/components/ui/Modal'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { doctorSchema } from '@/schemas/doctor'
import { toApiError, type ApiError } from '@/services/apiError'
import { doctorsService } from '@/services/doctorsService'
import type { FieldErrors } from '@/types/api'
import type { DoctorAdmin } from '@/types/doctor'
import type { Department } from '@/types/opd'
import { validate } from '@/utils/forms'

interface DoctorFormModalProps {
  doctor?: DoctorAdmin
  departments: Department[]
  onClose: () => void
  onSaved: (doctor: DoctorAdmin) => void
}

interface FormValues {
  name: string
  graduation: string
  postGraduation: string
  departmentId: string
  consultationFee: string
}

export function DoctorFormModal({ doctor, departments, onClose, onSaved }: DoctorFormModalProps) {
  const editing = Boolean(doctor)
  const online = useOnlineStatus()
  const [values, setValues] = useState<FormValues>({
    name: doctor?.name ?? '',
    graduation: doctor?.graduation ?? '',
    postGraduation: doctor?.postGraduation ?? '',
    departmentId: doctor?.departmentId ? String(doctor.departmentId) : '',
    consultationFee: doctor ? String(Number(doctor.consultationFee)) : '',
  })
  const [isActive, setIsActive] = useState(doctor?.isActive ?? true)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [failure, setFailure] = useState<ApiError | null>(null)
  const [pending, setPending] = useState(false)

  const departmentOptions = departments.map((department) => ({
    value: String(department.id),
    label: `${department.name} (${department.type})`,
  }))

  const handleChange = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
    setFailure(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = validate(doctorSchema, values)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    const payload = {
      name: result.values.name,
      graduation: result.values.graduation,
      postGraduation: result.values.postGraduation,
      departmentId: Number(result.values.departmentId),
      consultationFee: Number(result.values.consultationFee),
    }
    setPending(true)
    try {
      onSaved(
        doctor
          ? await doctorsService.update(doctor.id, { ...payload, isActive })
          : await doctorsService.create(payload),
      )
    } catch (error) {
      const apiError = toApiError(error)
      setErrors(apiError.fieldErrors)
      setFailure(Object.keys(apiError.fieldErrors).length ? null : apiError)
      setPending(false)
    }
  }

  return (
    <Modal title={editing ? 'Edit doctor' : 'Add doctor'} onClose={onClose} busy={pending}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {!editing && (
          <Alert kind="info">
            A doctor does not need a login. To let a doctor sign in, add a user with the Doctor role on the Users page
            and pick this doctor.
          </Alert>
        )}
        {failure && (
          <Alert kind="error" title="Could not save the doctor">
            {failure.message}
          </Alert>
        )}
        <TextField
          label="Doctor name"
          name="name"
          value={values.name}
          onChange={handleChange('name')}
          error={errors.name}
          disabled={pending}
          required
          autoFocus
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Graduation"
            name="graduation"
            placeholder="MBBS, BUMS…"
            maxLength={15}
            value={values.graduation}
            onChange={handleChange('graduation')}
            error={errors.graduation}
            disabled={pending}
            required
          />
          <TextField
            label="Post graduation"
            name="postGraduation"
            placeholder="MD, MS… (optional)"
            maxLength={10}
            value={values.postGraduation}
            onChange={handleChange('postGraduation')}
            error={errors.postGraduation}
            disabled={pending}
          />
        </div>
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
        <TextField
          label="Consultation fee (₹)"
          name="consultationFee"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          hint="Billed with every new visit."
          value={values.consultationFee}
          onChange={handleChange('consultationFee')}
          error={errors.consultationFee}
          disabled={pending}
          required
        />
        {editing && (
          <CheckboxField
            label="Active (inactive doctors cannot be chosen for new visits)"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            disabled={pending}
          />
        )}
        {!online && <p className="text-sm font-medium text-error">You are offline. Connect to the internet to save.</p>}
        <div className="modal-action mt-0">
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" loading={pending} loadingText="Saving…" disabled={!online}>
            {editing ? 'Save changes' : 'Add doctor'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
