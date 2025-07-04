/**
 * @fileoverview SettingsNavButton component for settings page navigation
 * Implements cypherpunk theme with proper hover states and glow effects
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface SettingsNavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

/**
 * SettingsNavButton component for settings page navigation
 * Provides active states with Matrix green glow and proper hover effects
 */
const SettingsNavButton = forwardRef<HTMLButtonElement, SettingsNavButtonProps>(
  (
    {
      className,
      isActive = false,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'w-full flex items-center gap-3 p-3 rounded-sm text-left font-mono tracking-wide',
          'transition-all duration-200 ease-in-out cursor-pointer outline-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
          
          // Active state - Matrix green background with black text
          isActive && [
            'bg-[#00ff41] text-black font-semibold border border-[#00ff41]',
            'shadow-[0_0_10px_rgba(0,255,65,0.5)] transform scale-[1.02]',
            'hover:bg-[#00cc33] hover:border-[#00cc33]'
          ],
          
          // Inactive state - ghost styling with hover effects
          !isActive && [
            'text-text-secondary border border-transparent',
            'hover:text-text-primary hover:bg-bg-hover hover:border-border-primary',
            'hover:shadow-sm hover:transform hover:scale-[1.01]',
            'hover:text-accent-primary'
          ],
          
          className
        )}
        {...props}
      >
        {icon && (
          <span className={cn(
            'transition-all duration-200 flex items-center',
            isActive ? 'text-black' : 'text-inherit'
          )}>
            {icon}
          </span>
        )}
        <span className={cn(
          'font-medium transition-all duration-200',
          isActive ? 'font-bold text-black' : 'font-normal'
        )}>
          {children}
        </span>
        
        {/* Active indicator dot */}
        {isActive && (
          <div className="ml-auto w-2 h-2 bg-black rounded-full animate-pulse" />
        )}
      </button>
    )
  }
)

SettingsNavButton.displayName = 'SettingsNavButton'

export default SettingsNavButton 