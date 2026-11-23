import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  error?: string
  hint?: string
  leading?: ReactNode
  trailing?: ReactNode
}

export function TextField({ label, error, hint, leading, trailing, className = '', ...rest }: TextFieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const hasMessage = Boolean(error || hint)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {rest.required && <span className="text-error"> *</span>}
      </label>
      <div
        className={`input w-full items-center gap-2 border-base-content/60 bg-base-100 ${error ? 'input-error border-error' : ''}`}
      >
        {leading && (
          <span className="text-primary" aria-hidden="true">
            {leading}
          </span>
        )}
        <input
          id={id}
          className={`grow ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={hasMessage ? messageId : undefined}
          {...rest}
        />
        {trailing && <div className="-mr-2 flex items-center">{trailing}</div>}
      </div>
      {hasMessage && (
        <p
          id={messageId}
          role={error ? 'alert' : undefined}
          className={`text-sm ${error ? 'font-medium text-error' : ''}`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
