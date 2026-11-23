import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useResource } from '@/hooks/useResource'
import { createUserSchema, editUserSchema } from '@/schemas/user'
import { toApiError, type ApiError } from '@/services/apiError'
import { doctorsService } from '@/services/doctorsService'
import { usersService } from '@/services/usersService'
import type { FieldErrors } from '@/types/api'
import type { UserRole } from '@/types/auth'
import type { StaffUser } from '@/types/user'
import { validate } from '@/utils/forms'
import { ROLE_LABELS } from '@/utils/roles'

interface UserFormModalProps {
  user?: StaffUser
  isSelf?: boolean
  onClose: () => void
  onSaved: (user: StaffUser) => void
}

interface FormValues {
  name: string
  mobile: string
  auth: string
  role: UserRole | ''
  doctorId: string
}

const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as UserRole[]).map((role) => ({ value: role, label: ROLE_LABELS[role] }))

export function UserFormModal({ user, isSelf = false, onClose, onSaved }: UserFormModalProps) {
  const editing = Boolean(user)
  const online = useOnlineStatus()
  const [values, setValues] = useState<FormValues>({
    name: user?.name ?? '',
    mobile: user?.mobile ?? '',
    auth: user?.auth ?? '',
    role: user?.role ?? '',
    doctorId: user?.doctorId ? String(user.doctorId) : '',
  })
  const doctors = useResource(doctorsService.list, undefined)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [failure, setFailure] = useState<ApiError | null>(null)
  const [pending, setPending] = useState(false)

  const handleChange = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = field === 'mobile' ? event.target.value.replace(/\D/g, '') : event.target.value
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
    setFailure(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = editing ? validate(editUserSchema, values) : validate(createUserSchema, values)
    const needsDoctor = values.role === 'doctor' && !values.doctorId
    if (!result.ok || needsDoctor) {
      setErrors({
        ...(result.ok ? {} : result.errors),
        ...(needsDoctor ? { doctorId: 'Choose the doctor this user is' } : {}),
      })
      return
    }
    const doctorId = values.role === 'doctor' ? Number(values.doctorId) : null
    setPending(true)
    try {
      const saved = user
        ? await usersService.update(user.id, {
            name: result.values.name,
            mobile: result.values.mobile,
            role: result.values.role,
            doctorId,
          })
        : await usersService.create({ ...createUserSchema.parse(values), doctorId })
      onSaved(saved)
    } catch (error) {
      const apiError = toApiError(error)
      const fieldErrors = { ...apiError.fieldErrors }
      if (apiError.code === 'MOBILE_IN_USE') fieldErrors.mobile = apiError.message
      if (apiError.code === 'LOGIN_ID_IN_USE') fieldErrors.auth = apiError.message
      setErrors(fieldErrors)
      setFailure(apiError.code === 'MOBILE_IN_USE' || apiError.code === 'LOGIN_ID_IN_USE' ? null : apiError)
      setPending(false)
    }
  }

  return (
    <Modal title={editing ? 'Edit user' : 'Add user'} onClose={onClose} busy={pending}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {!editing && (
          <Alert kind="info">
            The first password is the mobile number. The user must set a new password at the first sign-in.
          </Alert>
        )}
        {failure && (
          <Alert kind="error" title="Could not save the user">
            {failure.message}
          </Alert>
        )}
        <TextField
          label="Full name"
          name="name"
          value={values.name}
          onChange={handleChange('name')}
          error={errors.name}
          disabled={pending}
          required
          autoFocus
        />
        <TextField
          label="Mobile number"
          name="mobile"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit mobile number"
          value={values.mobile}
          onChange={handleChange('mobile')}
          error={errors.mobile}
          disabled={pending}
          required
        />
        <TextField
          label="Login id"
          name="auth"
          maxLength={10}
          placeholder="3 to 10 letters or digits"
          hint={editing ? 'The login id cannot be changed.' : undefined}
          value={values.auth}
          onChange={handleChange('auth')}
          error={errors.auth}
          disabled={pending || editing}
          required
        />
        <SelectField
          label="Role"
          name="role"
          placeholder="Choose a role"
          options={ROLE_OPTIONS}
          value={values.role}
          onChange={handleChange('role')}
          error={errors.role}
          disabled={pending || isSelf}
          required
        />
        {isSelf && <p className="-mt-2 text-sm">You cannot change your own role.</p>}
        {values.role === 'doctor' && (
          <SelectField
            label="Doctor"
            name="doctorId"
            placeholder={doctors.status === 'loading' ? 'Loading doctors…' : 'Choose the doctor this user is'}
            options={(doctors.data ?? []).map((doctor) => ({
              value: String(doctor.id),
              label: `${doctor.name}${doctor.departmentName ? ` · ${doctor.departmentName}` : ''}`,
            }))}
            value={values.doctorId}
            onChange={handleChange('doctorId')}
            error={errors.doctorId ?? (doctors.status === 'error' ? 'The doctors could not be loaded' : undefined)}
            disabled={pending || doctors.status !== 'success'}
            required
          />
        )}
        <div className="modal-action mt-0">
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" loading={pending} loadingText="Saving…" disabled={!online}>
            {editing ? 'Save changes' : 'Add user'}
          </Button>
        </div>
        {!online && (
          <p className="text-center text-sm font-medium text-error">
            You are offline. Connect to the internet to save.
          </p>
        )}
      </form>
    </Modal>
  )
}
