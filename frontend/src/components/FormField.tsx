import type { InputHTMLAttributes } from 'react'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

function FormField({ label, id, ...inputProps }: FormFieldProps) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} {...inputProps} />
    </label>
  )
}

export default FormField
