import { ButtonHTMLAttributes, forwardRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
  href?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild, href, children, ...props }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light-purple focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
      {
        'btn-primary': variant === 'primary',
        'bg-secondary-purple text-white hover:bg-secondary-dark': variant === 'secondary',
        'border border-white bg-transparent text-white hover:bg-white hover:text-primary-dark': variant === 'outline',
        'text-white hover:text-primary-light-purple': variant === 'ghost',
      },
      {
        'h-8 px-3 text-sm': size === 'sm',
        'h-10 px-4 py-2': size === 'md',
        'h-12 px-6 text-lg': size === 'lg',
      },
      className
    )

    // If href is provided, automatically use asChild with Link
    if (href) {
      return (
        <Link href={href} className={baseClasses}>
          {children}
        </Link>
      )
    }

    if (asChild) {
      return (
        <span className={baseClasses} {...props}>
          {children}
        </span>
      )
    }

    return (
      <button
        className={baseClasses}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
