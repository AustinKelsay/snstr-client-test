/**
 * @fileoverview CopyButton component for copying text to clipboard
 * Provides visual feedback and supports NIP-19 identifiers with display formatting
 * Reusable across the application with consistent UX
 */

import React, { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatNip19ForDisplay, getEntityDescription, isNip19Entity } from '@/utils/nip19'

interface CopyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> {
  /** Text to copy to clipboard */
  text: string
  /** Optional display text (if different from copy text) */
  displayText?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Style variant */
  variant?: 'ghost' | 'subtle' | 'solid'
  /** Whether to show the text inline */
  showText?: boolean
  /** Whether to format NIP-19 entities for display */
  formatNip19?: boolean
  /** Custom tooltip text */
  tooltip?: string
}

/**
 * CopyButton component provides copy-to-clipboard functionality with visual feedback
 * Automatically detects and formats NIP-19 entities for display
 * Shows temporary success state after copying
 */
export function CopyButton({
  text,
  displayText,
  size = 'md',
  variant = 'ghost',
  showText = true,
  formatNip19 = true,
  tooltip,
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  // Handle copy to clipboard
  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [text])

  // Generate display text
  const getDisplayText = () => {
    if (displayText) return displayText
    
    if (formatNip19 && isNip19Entity(text)) {
      return formatNip19ForDisplay(text, { 
        startChars: size === 'lg' ? 10 : size === 'md' ? 8 : 6,
        endChars: size === 'lg' ? 6 : 4,
        showPrefix: false 
      })
    }
    
    return text
  }

  // Generate tooltip text
  const getTooltip = () => {
    if (tooltip) return tooltip
    
    if (isNip19Entity(text)) {
      const description = getEntityDescription(text)
      return `Copy ${description}: ${text}`
    }
    
    return `Copy: ${text}`
  }

  // Size classes
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2'
  }

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  // Variant classes
  const variantClasses = {
    ghost: 'hover:bg-bg-active',
    subtle: 'bg-bg-secondary hover:bg-bg-active border border-border-primary',
    solid: 'bg-accent-primary hover:bg-accent-secondary text-text-inverse'
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'group inline-flex items-center transition-all duration-200 rounded font-mono',
        'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        showText ? 'px-2 py-1' : 'p-1',
        className
      )}
      title={getTooltip()}
      {...props}
    >
      {showText && (
        <span className={cn(
          'transition-colors',
          variant === 'ghost' && 'text-text-tertiary group-hover:text-accent-primary',
          variant === 'subtle' && 'text-text-secondary group-hover:text-text-primary',
          variant === 'solid' && 'text-text-inverse'
        )}>
          {getDisplayText()}
        </span>
      )}
      
      {copied ? (
        <Check className={cn(
          iconSizeClasses[size],
          variant === 'solid' ? 'text-text-inverse' : 'text-accent-primary'
        )} />
      ) : (
        <Copy className={cn(
          iconSizeClasses[size],
          'transition-all duration-200',
          variant === 'ghost' && 'opacity-0 group-hover:opacity-100 text-text-secondary group-hover:text-accent-primary',
          variant === 'subtle' && 'text-text-secondary group-hover:text-accent-primary',
          variant === 'solid' && 'text-text-inverse'
        )} />
      )}
    </button>
  )
}

/**
 * NpubCopyButton - Specialized component for copying public keys
 */
export function NpubCopyButton({ 
  pubkey, 
  className, 
  ...props 
}: { pubkey: string; className?: string } & Omit<CopyButtonProps, 'text'>) {
  return (
    <CopyButton
      text={pubkey}
      className={cn('text-accent-primary', className)}
      tooltip={`Copy public key: ${pubkey}`}
      {...props}
    />
  )
}

/**
 * NoteCopyButton - Specialized component for copying event IDs
 */
export function NoteCopyButton({ 
  eventId, 
  className, 
  ...props 
}: { eventId: string; className?: string } & Omit<CopyButtonProps, 'text'>) {
  return (
    <CopyButton
      text={eventId}
      className={cn('text-text-quaternary', className)}
      tooltip={`Copy note ID: ${eventId}`}
      {...props}
    />
  )
} 