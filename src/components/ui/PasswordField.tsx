import { useState } from 'react'
import { TextField, type TextFieldProps } from './TextField'

export function PasswordField({ disabled, ...rest }: Omit<TextFieldProps, 'type' | 'trailing'>) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      {...rest}
      disabled={disabled}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      }
    />
  )
}
