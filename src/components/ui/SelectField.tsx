import { useId, type SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string
  options: SelectOption[]
  error?: string
  placeholder?: string
}

export function SelectField({ label, options, error, placeholder, className = '', ...rest }: SelectFieldProps) {
  const id = useId()
  const messageId = `${id}-message`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {rest.required && <span className="text-error"> *</span>}
      </label>
      <select
        id={id}
        className={`select w-full border-base-content/60 bg-base-100 ${error ? 'select-error border-error' : ''} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? messageId : undefined}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={messageId} role="alert" className="text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  )
}
