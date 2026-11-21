import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { PasswordField } from '@/components/ui/PasswordField'
import { TextField } from '@/components/ui/TextField'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { loginSchema, type LoginValues } from '@/schemas/auth'
import { toApiError, type ApiError } from '@/services/apiError'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/stores/toastStore'
import type { FieldErrors } from '@/types/api'
import { validate } from '@/utils/forms'

export default function LoginPage() {
  const signIn = useAuthStore((state) => state.signIn)
  const online = useOnlineStatus()
  const [values, setValues] = useState<LoginValues>({ mobile: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [failure, setFailure] = useState<ApiError | null>(null)
  const [pending, setPending] = useState(false)

  const handleChange = (field: keyof LoginValues) => (event: ChangeEvent<HTMLInputElement>) => {
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
    const result = validate(loginSchema, values)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setPending(true)
    try {
      await signIn(result.values)
      toast.success('Signed in')
    } catch (error) {
      const apiError = toApiError(error)
      const fieldErrors = { ...apiError.fieldErrors }
      if (apiError.code === 'MOBILE_NOT_FOUND') fieldErrors.mobile = apiError.message
      if (apiError.code === 'INCORRECT_PASSWORD') fieldErrors.password = apiError.message
      setErrors(fieldErrors)
      setFailure(apiError.code === 'MOBILE_NOT_FOUND' || apiError.code === 'INCORRECT_PASSWORD' ? null : apiError)
    } finally {
      setPending(false)
    }
  }

  return (
    <Section title="Sign in" description="Use your registered mobile number to continue.">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {failure && (
          <Alert kind="error" title="Could not sign in">
            {failure.message}
          </Alert>
        )}
        <TextField
          label="Mobile number"
          name="mobile"
          type="tel"
          inputMode="numeric"
          autoComplete="username"
          maxLength={10}
          placeholder="10-digit mobile number"
          value={values.mobile}
          onChange={handleChange('mobile')}
          error={errors.mobile}
          disabled={pending}
          required
          autoFocus
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          onChange={handleChange('password')}
          error={errors.password}
          disabled={pending}
          required
        />
        <Alert kind="info" title="Signing in for the first time?">
          Your password is your 10-digit mobile number. You will then be asked to set a new password.
        </Alert>
        <Button type="submit" fullWidth loading={pending} loadingText="Signing in…" disabled={!online}>
          Sign in
        </Button>
        {!online && <p className="text-center text-sm font-medium text-error">You are offline. Connect to the internet to sign in.</p>}
      </form>
    </Section>
  )
}
