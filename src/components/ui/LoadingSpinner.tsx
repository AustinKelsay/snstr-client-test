/**
 * Loading spinner component with customizable size and text
 * Uses the cypherpunk theme colors for consistent branding
 */

import { cn } from '@/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
  centered?: boolean
}

function LoadingSpinner({ size = 'md', text, className, centered = false }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const containerClasses = cn('flex items-center gap-2', centered && 'justify-center', className)

  const spinnerClasses = cn(
    'border-2 border-muted border-t-primary rounded-full animate-spin',
    sizes[size]
  )

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses} role="status" aria-label="Loading" />
      {text && <span className="text-muted-foreground text-sm font-medium">{text}</span>}
    </div>
  )
}

export default LoadingSpinner
