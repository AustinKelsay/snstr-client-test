/**
 * @fileoverview Auth feature public API exports
 * Provides clean interface for authentication functionality
 */

// Main authentication client and methods
export {
  AuthClient,
  authClient,
  loginUser,
  logoutUser,  
  refreshUserProfile,
  signUserEvent,
  initializeAuth
} from './authClient'

// React hooks for components
export {
  useAuth,
  useIsAuthenticated,
  useCurrentUser,
  useCurrentPublicKey,
  useExtensionCapabilities,
  type UseAuthReturn
} from './useAuth'

// Redux slice (re-export for convenience)
export {
  setLoading,
  setError,
  clearError,
  setAuthenticated,
  setUser,
  setPublicKey,
  setExtension,
  logout
} from '@/store/slices/authSlice'

// Types (re-export for convenience)
export type {
  AuthState,
  UserProfile,
  ExtensionCapabilities,
  ExtensionDetection,
  UnsignedEvent,
  SignedEvent,
  NostrExtension
} from '@/types/auth' 