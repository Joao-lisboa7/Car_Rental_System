import type { ButtonHTMLAttributes } from 'react'

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}

function PrimaryButton({ children, className = '', ...props }: PrimaryButtonProps) {
  return (
    <button className={`primary-button ${className}`} {...props}>
      {children}
    </button>
  )
}

export default PrimaryButton
