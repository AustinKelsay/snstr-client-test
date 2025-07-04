/**
 * Button component with multiple variants and sizes
 * Implements the cypherpunk design system with proper accessibility
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      inline-flex items-center justify-center gap-2 border-0 rounded-sm font-medium
      transition-all duration-200 ease-in-out cursor-pointer outline-none
      focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:transform active:scale-98
    `

    const variants = {
      primary: `
        bg-accent-primary text-text-inverse font-semibold
        hover:bg-accent-secondary hover:shadow-glow-green hover:-translate-y-0.5
        border border-accent-primary
      `,
      secondary: `
        bg-transparent text-accent-primary border border-accent-primary font-medium
        hover:bg-accent-primary hover:text-text-inverse hover:shadow-glow-green
      `,
      accent: `
        bg-accent-tertiary text-text-primary border border-accent-tertiary
        hover:bg-accent-secondary hover:border-accent-secondary hover:shadow-glow-green
      `,
      outline: `
        bg-transparent text-text-primary border border-border-primary
        hover:bg-bg-hover hover:border-border-secondary
      `,
      ghost: `
        bg-transparent text-text-secondary border-0
        hover:bg-bg-hover hover:text-text-primary
      `,
      destructive: `
        bg-error text-text-primary border border-error font-medium
        hover:bg-error/90 hover:shadow-glow-red hover:-translate-y-0.5
      `,
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs font-mono tracking-wide',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base font-semibold',
      icon: 'h-10 w-10 p-0',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          isLoading && 'cursor-wait',
          className
        )}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">LOADING...</span>
          </div>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
