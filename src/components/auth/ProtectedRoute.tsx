/**
 * @fileoverview Protected route component for authentication-required pages
 * Handles authentication state and provides loading/error states
 */

import React from 'react'
import { useAuth } from '@/features/auth'
import { FullLoginButton } from './LoginButton'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'

interface ProtectedRouteProps {
  /** Child components to render when authenticated */
  children: React.ReactNode
  /** Custom fallback component for unauthenticated users */
  fallback?: React.ReactNode
  /** Whether to show the full login page or just redirect */
  showLoginPage?: boolean
  /** Custom loading component */
  loadingComponent?: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Protected route wrapper that requires user authentication
 * Shows login prompts for unauthenticated users and loading states
 */
export function ProtectedRoute({
  children,
  fallback,
  showLoginPage = true,
  loadingComponent,
  className
}: ProtectedRouteProps) {
  const { 
    isAuthenticated, 
    extensionAvailable, 
    isLoading, 
    error,
    clearError
  } = useAuth()

  // Show loading state during initialization
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center min-h-96', className)}>
        {loadingComponent || (
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-text-secondary">Initializing authentication...</p>
          </div>
        )}
      </div>
    )
  }

  // Show authenticated content
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Show custom fallback if provided
  if (fallback) {
    return <div className={className}>{fallback}</div>
  }

  // Show login page for unauthenticated users
  if (showLoginPage) {
    return (
      <div className={cn('flex items-center justify-center min-h-96', className)}>
        <div className="max-w-md w-full mx-auto p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent-primary/20 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-accent-primary" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                Authentication Required
              </h2>
              <p className="text-text-secondary mt-2">
                Please connect your Nostr extension to access this page
              </p>
            </div>

            {error && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg 
                    className="w-5 h-5 text-error flex-shrink-0 mt-0.5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-error font-medium">Authentication Error</p>
                    <p className="text-sm text-error/80 mt-1">{error}</p>
                    <button
                      onClick={clearError}
                      className="text-sm text-error hover:text-error/80 mt-2 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!extensionAvailable && !error && (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg 
                    className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-warning font-medium">Extension Required</p>
                    <p className="text-sm text-warning/80 mt-1">
                      Please install a NIP-07 compatible Nostr extension like{' '}
                      <a 
                        href="https://getalby.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:no-underline"
                      >
                        Alby
                      </a>
                      {' '}or{' '}
                      <a 
                        href="https://github.com/fiatjaf/nos2x" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:no-underline"
                      >
                        nos2x
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <FullLoginButton variant="primary" size="lg" />

          <div className="text-center">
            <p className="text-xs text-text-tertiary">
              New to Nostr?{' '}
              <a 
                href="https://nostr.how" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent-primary hover:text-accent-secondary underline"
              >
                Learn more about Nostr
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Default behavior - just return null
  return null
}

/**
 * Simple auth gate that only shows children when authenticated
 * No UI fallback - just returns null when not authenticated
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : null
}

/**
 * Inverse auth gate - only shows children when NOT authenticated
 * Useful for login pages that should redirect when user is already logged in
 */
export function GuestGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? <>{children}</> : null
} 