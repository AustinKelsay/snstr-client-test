/**
 * @fileoverview Login button component for NIP-07 authentication
 * Handles login flow with proper loading states and error feedback
 */

import React from 'react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/features/auth'
import { cn } from '@/utils/cn'

interface LoginButtonProps {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Custom text for the button */
  children?: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Whether to show full text or icon only */
  fullWidth?: boolean
  /** Custom click handler (overrides default login) */
  onClick?: () => void
}

/**
 * Login button component that integrates with NIP-07 extensions
 * Shows appropriate states based on authentication status and extension availability
 */
export function LoginButton({
  variant = 'primary',
  size = 'md',
  children,
  className,
  fullWidth = false,
  onClick
}: LoginButtonProps) {
  const { 
    isAuthenticated, 
    extensionAvailable, 
    isLoading, 
    error,
    login,
    clearError
  } = useAuth()

  // Handle click - use custom handler or default login
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Clear any existing errors before attempting login
      if (error) {
        clearError()
      }
      login()
    }
  }

  // Don't show login button if user is already authenticated
  if (isAuthenticated) {
    return null
  }

  // Get button text based on state
  const getButtonText = () => {
    if (children) {
      return children
    }

    if (isLoading) {
      return fullWidth ? 'Connecting...' : '...'
    }

    if (!extensionAvailable) {
      return fullWidth ? 'Install Nostr Extension' : 'Install'
    }

    return fullWidth ? 'Connect Wallet' : 'Connect'
  }

  // Get button state
  const isDisabled = isLoading || !extensionAvailable
  const showSpinner = isLoading

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        'relative',
        fullWidth && 'w-full',
        className
      )}
      title={
        !extensionAvailable 
          ? 'Please install a NIP-07 compatible extension like Alby or nos2x'
          : 'Connect your Nostr extension'
      }
    >
      {showSpinner && (
        <LoadingSpinner 
          size="sm" 
          className="mr-2" 
        />
      )}
      {getButtonText()}
    </Button>
  )
}

/**
 * Compact login button for tight spaces
 */
export function CompactLoginButton(props: Omit<LoginButtonProps, 'fullWidth'>) {
  return (
    <LoginButton
      {...props}
      fullWidth={false}
    />
  )
}

/**
 * Full-width login button for forms and main CTAs
 */
export function FullLoginButton(props: Omit<LoginButtonProps, 'fullWidth'>) {
  return (
    <LoginButton
      {...props}
      fullWidth={true}
    />
  )
} 