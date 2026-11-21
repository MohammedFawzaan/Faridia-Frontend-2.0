import { useId, type InputHTMLAttributes } from 'react'

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label: string
}

export function CheckboxField({ label, className = '', ...rest }: CheckboxFieldProps) {
  const id = useId()

  return (
    <div className="flex items-center gap-2">
      <input id={id} type="checkbox" className={`checkbox checkbox-primary ${className}`} {...rest} />
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
    </div>
  )
}
