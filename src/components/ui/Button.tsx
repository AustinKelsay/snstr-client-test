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
    const baseClasses = 'btn-base transition-all duration-200 font-medium'

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm',
      outline: 'border border-border bg-transparent hover:bg-muted text-foreground',
      ghost: 'hover:bg-muted text-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 py-3 text-lg',
      icon: 'h-10 w-10 p-0',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          (isLoading || disabled) && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="spinner mr-2" />
            Loading...
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
