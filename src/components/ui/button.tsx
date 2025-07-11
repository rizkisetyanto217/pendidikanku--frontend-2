import { ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = 'default', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-md px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

    const variants = {
      default: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500',
      secondary: 'bg-teal-100 text-teal-800 hover:bg-teal-200 focus:ring-teal-300',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
    }

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
