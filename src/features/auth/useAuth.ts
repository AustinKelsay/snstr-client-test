/**
 * @fileoverview React hook for authentication state and methods
 * Provides easy access to auth state and actions throughout the application
 */

import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect } from 'react'
import type { RootState } from '@/store'
import { clearError } from '@/store/slices/authSlice'
import { 
  loginUser,
  logoutUser,
  refreshUserProfile,
  signUserEvent,
  initializeAuth
} from './authClient'
import type { UnsignedEvent, SignedEvent, UserProfile, ExtensionCapabilities } from '@/types/auth'
import type { PublicKey } from '@/types'

/**
 * Authentication hook return type
 */
export interface UseAuthReturn {
  // State
  isAuthenticated: boolean
  user: UserProfile | null
  publicKey: PublicKey | null
  extensionAvailable: boolean
  extensionCapabilities: ExtensionCapabilities | null
  isLoading: boolean
  error: string | null

  // Actions
  login: () => Promise<void>
  logout: () => Promise<void>
  signEvent: (event: UnsignedEvent) => Promise<SignedEvent>
  refreshProfile: () => Promise<void>
  clearError: () => void
  initialize: () => Promise<void>

  // Utility methods
  isExtensionCapable: (capability: keyof ExtensionCapabilities) => boolean
  getUserDisplayName: () => string
  isCurrentUser: (pubkey: PublicKey) => boolean
}

/**
 * React hook for authentication
 * Provides access to auth state and methods
 * 
 * @returns UseAuthReturn - Authentication state and methods
 */
export function useAuth(): UseAuthReturn {
  const dispatch = useDispatch()
  
  // Select auth state from Redux store
  const authState = useSelector((state: RootState) => state.auth)

  // Clear error action
  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  // Login wrapper with error handling
  const handleLogin = useCallback(async () => {
    try {
      await loginUser()
    } catch (error) {
      // Error is already handled by authClient and stored in Redux
      console.error('Login failed:', error)
    }
  }, [])

  // Logout wrapper
  const handleLogout = useCallback(async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [])

  // Sign event wrapper with error handling
  const handleSignEvent = useCallback(async (event: UnsignedEvent): Promise<SignedEvent> => {
    try {
      return await signUserEvent(event)
    } catch (error) {
      console.error('Sign event failed:', error)
      throw error
    }
  }, [])

  // Refresh profile wrapper
  const handleRefreshProfile = useCallback(async () => {
    try {
      await refreshUserProfile()
    } catch (error) {
      console.error('Refresh profile failed:', error)
    }
  }, [])

  // Initialize auth wrapper
  const handleInitialize = useCallback(async () => {
    try {
      await initializeAuth()
    } catch (error) {
      console.error('Auth initialization failed:', error)
    }
  }, [])

  // Check if extension has specific capability
  const isExtensionCapable = useCallback((capability: keyof ExtensionCapabilities): boolean => {
    return authState.extensionCapabilities?.[capability] ?? false
  }, [authState.extensionCapabilities])

  // Get display name for user
  const getUserDisplayName = useCallback((): string => {
    if (!authState.user) return 'Anonymous'
    
    return (
      authState.user.display_name ||
      authState.user.name ||
      `${authState.user.pubkey.slice(0, 8)}...`
    )
  }, [authState.user])

  // Check if a pubkey belongs to current user
  const isCurrentUser = useCallback((pubkey: PublicKey): boolean => {
    return authState.publicKey === pubkey
  }, [authState.publicKey])

  // Auto-initialize on mount if not already done
  useEffect(() => {
    if (!authState.extensionAvailable && !authState.isLoading && !authState.error) {
      handleInitialize()
    }
  }, [authState.extensionAvailable, authState.isLoading, authState.error, handleInitialize])

  return {
    // State from Redux
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    publicKey: authState.publicKey,
    extensionAvailable: authState.extensionAvailable,
    extensionCapabilities: authState.extensionCapabilities,
    isLoading: authState.isLoading,
    error: authState.error,

    // Actions
    login: handleLogin,
    logout: handleLogout,
    signEvent: handleSignEvent,
    refreshProfile: handleRefreshProfile,
    clearError: handleClearError,
    initialize: handleInitialize,

    // Utility methods
    isExtensionCapable,
    getUserDisplayName,
    isCurrentUser,
  }
}

/**
 * Hook to check if user is authenticated
 * Simpler version for components that only need auth status
 * 
 * @returns boolean - True if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  return useSelector((state: RootState) => state.auth.isAuthenticated)
}

/**
 * Hook to get current user info
 * Returns null if not authenticated
 * 
 * @returns UserProfile | null - Current user or null
 */
export function useCurrentUser(): UserProfile | null {
  return useSelector((state: RootState) => state.auth.user)
}

/**
 * Hook to get current public key
 * Returns null if not authenticated
 * 
 * @returns PublicKey | null - Current user's public key or null
 */
export function useCurrentPublicKey(): PublicKey | null {
  return useSelector((state: RootState) => state.auth.publicKey)
}

/**
 * Hook to check extension capabilities
 * 
 * @returns ExtensionCapabilities | null - Extension capabilities or null
 */
export function useExtensionCapabilities(): ExtensionCapabilities | null {
  return useSelector((state: RootState) => state.auth.extensionCapabilities)
} 