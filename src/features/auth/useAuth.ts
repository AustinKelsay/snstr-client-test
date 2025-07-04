/**
 * @fileoverview useAuth hook for managing authentication
 * Handles extension detection, login, logout, and auth state
 */

import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { 
  detectExtension, 
  loginWithExtension, 
  initializeAuth,
  logout as logoutAction,
  clearError
} from '@/store/slices/authSlice'
import { 
  selectIsAuthenticated, 
  selectUser, 
  selectPublicKey,
  selectExtensionStatus,
  selectAuthLoading,
  selectAuthError
} from '@/store/selectors/authSelectors'

/**
 * Custom hook for managing authentication state and actions
 * Automatically initializes extension detection on mount
 */
export default function useAuth() {
  const dispatch = useAppDispatch()
  
  // Select auth state from Redux
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectUser)
  const publicKey = useAppSelector(selectPublicKey)
  const extensionStatus = useAppSelector(selectExtensionStatus)
  const isLoading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)

  // Initialize auth on component mount
  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  // Auth actions
  const login = useCallback(async () => {
    try {
      await dispatch(loginWithExtension()).unwrap()
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }, [dispatch])

  const logout = useCallback(() => {
    dispatch(logoutAction())
  }, [dispatch])

  const detectExt = useCallback(async () => {
    try {
      await dispatch(detectExtension()).unwrap()
    } catch (error) {
      console.error('Extension detection failed:', error)
      throw error
    }
  }, [dispatch])

  const clearAuthError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    // State
    isAuthenticated,
    user,
    publicKey,
    extensionStatus,
    isLoading,
    error,
    
    // Actions
    login,
    logout,
    detectExtension: detectExt,
    clearError: clearAuthError,
    
    // Computed state
    canAuthenticate: extensionStatus.available && extensionStatus.hasBasicSupport,
    isReady: !isLoading,
  }
} 