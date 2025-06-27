/**
 * Authentication slice for Redux store
 * Manages user authentication state using NIP-07 browser extensions
 * Focuses on capabilities rather than specific extension brands
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, UserProfile, ExtensionCapabilities } from '@/types/auth'
import type { PublicKey } from '@/types'

// Initial state following NIP-07 capability-based approach
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  publicKey: null,
  extensionAvailable: false,
  extensionCapabilities: null,
  isLoading: false,
  error: null,
}

// Auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Loading state management
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
      if (action.payload) {
        state.error = null // Clear errors when starting new operation
      }
    },

    // Error management
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearError: state => {
      state.error = null
    },

    // Authentication state
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload
      if (!action.payload) {
        // Clear user data when not authenticated
        state.user = null
        state.publicKey = null
      }
    },

    // User profile management
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload
      if (action.payload) {
        state.publicKey = action.payload.pubkey
        state.isAuthenticated = true
      }
    },

    // Public key management
    setPublicKey: (state, action: PayloadAction<PublicKey | null>) => {
      state.publicKey = action.payload
    },

    // Extension management - capability-based
    setExtension: (
      state,
      action: PayloadAction<{ available: boolean; capabilities: ExtensionCapabilities }>
    ) => {
      state.extensionAvailable = action.payload.available
      state.extensionCapabilities = action.payload.capabilities
    },

    // Complete logout
    logout: state => {
      state.isAuthenticated = false
      state.user = null
      state.publicKey = null
      state.extensionAvailable = false
      state.extensionCapabilities = null
      state.error = null
      state.isLoading = false
    },
  },
})

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setAuthenticated,
  setUser,
  setPublicKey,
  setExtension,
  logout,
} = authSlice.actions

// Export reducer as default
export default authSlice.reducer
