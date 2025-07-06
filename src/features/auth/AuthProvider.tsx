/**
 * @fileoverview AuthProvider component
 * Initializes authentication and provides auth context to the app
 */

import useAuth from './useAuth'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * AuthProvider component that initializes authentication
 * Uses the useAuth hook to trigger extension detection on mount
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  // This will trigger initializeAuth() via the useAuth hook
  useAuth()
  
  return <>{children}</>
} 