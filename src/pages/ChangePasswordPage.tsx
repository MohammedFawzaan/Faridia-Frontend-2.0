import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { PasswordField } from '@/components/ui/PasswordField'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { changePasswordSchema, type ChangePasswordValues } from '@/schemas/auth'
import { toApiError, type ApiError } from '@/services/apiError'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/stores/toastStore'
import type { FieldErrors } from '@/types/api'
import { validate } from '@/utils/forms'

const EMPTY: ChangePasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' }

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const forced = useAuthStore((state) => state.user?.mustResetPassword ?? false)
  const changePassword = useAuthStore((state) => state.changePassword)
  const signOut = useAuthStore((state) => state.signOut)
  const online = useOnlineStatus()
  const [values, setValues] = useState<ChangePasswordValues>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [failure, setFailure] = useState<ApiError | null>(null)
  const [pending, setPending] = useState(false)

  const handleChange = (field: keyof ChangePasswordValues) => (event: ChangeEvent<HTMLInputElement>) => {
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
    const result = validate(changePasswordSchema, values)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setPending(true)
    try {
      await changePassword({ currentPassword: result.values.currentPassword, newPassword: result.values.newPassword })
      toast.success('Password changed')
      navigate('/', { replace: true })
    } catch (error) {
      const apiError = toApiError(error)
      setErrors(apiError.fieldErrors)
      setFailure(apiError)
    } finally {
      setPending(false)
    }
  }

  return (
    <Section title="Set a new password" description="Choose a password you will remember. It protects patient information.">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {forced && (
          <Alert kind="info" title="Password change required">
            Set a new password to continue. If this is your first sign-in, your current password is your mobile number.
          </Alert>
        )}
        {failure && (
          <Alert kind="error" title="Could not change the password">
            {failure.message}
          </Alert>
        )}
        <PasswordField
          label="Current password"
          name="currentPassword"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={handleChange('currentPassword')}
          error={errors.currentPassword}
          disabled={pending}
          required
          autoFocus
        />
        <PasswordField
          label="New password"
          name="newPassword"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          value={values.newPassword}
          onChange={handleChange('newPassword')}
          error={errors.newPassword}
          disabled={pending}
          required
        />
        <PasswordField
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          disabled={pending}
          required
        />
        <Button type="submit" fullWidth loading={pending} loadingText="Saving…" disabled={!online}>
          Save new password
        </Button>
        {!online && <p className="text-center text-sm font-medium text-error">You are offline. Connect to the internet to save.</p>}
        <Button variant="ghost" fullWidth onClick={forced ? signOut : () => navigate('/')} disabled={pending}>
          {forced ? 'Sign out' : 'Cancel'}
        </Button>
      </form>
    </Section>
  )
}
