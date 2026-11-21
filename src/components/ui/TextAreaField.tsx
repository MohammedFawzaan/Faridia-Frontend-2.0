import { useId, type TextareaHTMLAttributes } from 'react'

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string
  error?: string
}

export function TextAreaField({ label, error, className = '', ...rest }: TextAreaFieldProps) {
  const id = useId()
  const messageId = `${id}-message`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {rest.required && <span className="text-error"> *</span>}
      </label>
      <textarea
        id={id}
        rows={3}
        className={`textarea w-full border-base-content/60 bg-base-100 ${error ? 'textarea-error border-error' : ''} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? messageId : undefined}
        {...rest}
      />
      {error && (
        <p id={messageId} role="alert" className="text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  )
}
