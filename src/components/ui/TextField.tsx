import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  error?: string
  hint?: string
  trailing?: ReactNode
}

export function TextField({ label, error, hint, trailing, className = '', ...rest }: TextFieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const hasMessage = Boolean(error || hint)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {rest.required && <span className="text-error"> *</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          className={`input w-full border-base-content/60 bg-base-100 ${error ? 'input-error border-error' : ''} ${trailing ? 'pr-12' : ''} ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={hasMessage ? messageId : undefined}
          {...rest}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {hasMessage && (
        <p id={messageId} role={error ? 'alert' : undefined} className={`text-sm ${error ? 'font-medium text-error' : ''}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
