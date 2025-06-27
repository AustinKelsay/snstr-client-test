/**
 * @fileoverview User menu component for authenticated users
 * Shows user profile and provides logout and profile management options
 */

import React, { useState } from 'react'
import { useAuth } from '@/features/auth'
import { cn } from '@/utils/cn'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface UserMenuProps {
  /** Additional CSS classes */
  className?: string
  /** Placement of the menu */
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  /** Whether to show the full profile info */
  showProfile?: boolean
}

/**
 * User menu component for authenticated users
 * Displays user info and provides logout functionality
 */
export function UserMenu({ 
  className, 
  placement = 'bottom-right',
  showProfile = true
}: UserMenuProps) {
  const { 
    isAuthenticated, 
    user, 
    extensionCapabilities,
    isLoading,
    logout,
    refreshProfile,
    getUserDisplayName
  } = useAuth()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Handle profile refresh
  const handleRefreshProfile = async () => {
    try {
      setIsRefreshing(true)
      await refreshProfile()
    } catch (error) {
      console.error('Profile refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Get menu position classes
  const getMenuPosition = () => {
    switch (placement) {
      case 'bottom-left':
        return 'top-full left-0 mt-2'
      case 'bottom-right':
        return 'top-full right-0 mt-2'
      case 'top-left':
        return 'bottom-full left-0 mb-2'
      case 'top-right':
        return 'bottom-full right-0 mb-2'
      default:
        return 'top-full right-0 mt-2'
    }
  }

  return (
    <div className={cn('relative', className)}>
      {/* User Avatar/Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={cn(
          'flex items-center gap-3 p-2 rounded-lg',
          'bg-bg-secondary hover:bg-bg-hover',
          'border border-border-primary',
          'transition-all duration-200',
          'text-text-primary',
          isMenuOpen && 'bg-bg-hover'
        )}
        title="User menu"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
          {user.picture ? (
            <img 
              src={user.picture} 
              alt={getUserDisplayName()}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-accent-primary">
              {getUserDisplayName().charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* User Info (if showing profile) */}
        {showProfile && (
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-medium text-text-primary truncate max-w-32">
              {getUserDisplayName()}
            </span>
            <span className="text-xs text-text-secondary truncate max-w-32">
              {user.pubkey.slice(0, 8)}...
            </span>
          </div>
        )}

        {/* Dropdown Arrow */}
        <svg
          className={cn(
            'w-4 h-4 text-text-secondary transition-transform duration-200',
            isMenuOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu */}
          <div className={cn(
            'absolute z-20 min-w-64 max-w-80',
            'bg-bg-secondary border border-border-primary rounded-lg shadow-lg',
            'py-2',
            getMenuPosition()
          )}>
            {/* User Profile Section */}
            <div className="px-4 py-3 border-b border-border-primary">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={getUserDisplayName()}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-accent-primary">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-text-primary truncate">
                    {getUserDisplayName()}
                  </span>
                  {user.nip05 && (
                    <span className="text-sm text-accent-primary truncate">
                      {user.nip05}
                    </span>
                  )}
                  <span className="text-xs text-text-secondary font-mono">
                    {user.pubkey.slice(0, 16)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Extension Info */}
            <div className="px-4 py-2 border-b border-border-primary">
              <div className="text-xs text-text-secondary space-y-1">
                <div>Extension Connected</div>
                <div className="flex gap-2 flex-wrap">
                  {extensionCapabilities?.getPublicKey && (
                    <span className="px-2 py-1 bg-success/20 text-success rounded text-xs">
                      Auth
                    </span>
                  )}
                  {extensionCapabilities?.signEvent && (
                    <span className="px-2 py-1 bg-success/20 text-success rounded text-xs">
                      Sign
                    </span>
                  )}
                  {extensionCapabilities?.nip04 && (
                    <span className="px-2 py-1 bg-info/20 text-info rounded text-xs">
                      NIP-04
                    </span>
                  )}
                  {extensionCapabilities?.nip44 && (
                    <span className="px-2 py-1 bg-info/20 text-info rounded text-xs">
                      NIP-44
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Actions */}
            <div className="py-2">
              <button
                onClick={handleRefreshProfile}
                disabled={isRefreshing}
                className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-hover transition-colors flex items-center gap-2"
              >
                {isRefreshing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                Refresh Profile
              </button>

              <button
                onClick={() => {
                  // TODO: Navigate to profile page
                  setIsMenuOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-hover transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Profile
              </button>

              <button
                onClick={() => {
                  // TODO: Navigate to settings page
                  setIsMenuOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-hover transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>

              <div className="border-t border-border-primary mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  )}
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Compact user menu for smaller spaces
 */
export function CompactUserMenu(props: Omit<UserMenuProps, 'showProfile'>) {
  return (
    <UserMenu
      {...props}
      showProfile={false}
    />
  )
} 