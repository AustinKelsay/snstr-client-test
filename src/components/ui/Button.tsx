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
      inline-flex items-center justify-center gap-2 border rounded-sm font-medium font-mono
      transition-all duration-200 ease-in-out cursor-pointer outline-none
      focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:transform active:scale-[0.98] tracking-wide
    `

    const variants = {
      primary: `
        bg-transparent text-[#00ff41] border-[#00ff41] font-medium
        hover:bg-[#00ff41] hover:text-black hover:shadow-[0_0_10px_rgba(0,255,65,0.5)]
        hover:border-[#00ff41] hover:-translate-y-0.5
        shadow-sm hover:shadow-md
      `,
      secondary: `
        bg-transparent text-[#00ff41] border-[#00ff41] font-medium
        hover:bg-[#00ff41] hover:text-black hover:shadow-[0_0_10px_rgba(0,255,65,0.5)]
        hover:border-[#00ff41]
      `,
      accent: `
        bg-[#009922] text-text-primary border-[#009922]
        hover:bg-[#00cc33] hover:border-[#00cc33] hover:shadow-[0_0_10px_rgba(0,255,65,0.5)]
        hover:text-black hover:-translate-y-0.5
      `,
      outline: `
        bg-transparent text-text-primary border-border-primary
        hover:bg-bg-hover hover:border-border-secondary hover:text-accent-primary
        hover:shadow-sm
      `,
      ghost: `
        bg-transparent text-text-secondary border-transparent
        hover:bg-bg-hover hover:text-text-primary hover:border-border-primary
      `,
      destructive: `
        bg-transparent text-[#ff3366] border-[#ff3366] font-medium
        hover:bg-[#ff3366] hover:text-black hover:shadow-[0_0_10px_rgba(255,51,102,0.5)]
        hover:border-[#ff3366] hover:-translate-y-0.5
      `,
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs min-w-[60px]',
      md: 'h-10 px-4 text-sm min-w-[80px]',
      lg: 'h-12 px-6 text-base font-semibold min-w-[100px]',
      icon: 'h-10 w-10 p-0 min-w-[40px]',
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
