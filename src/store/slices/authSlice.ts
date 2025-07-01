/**
 * Authentication slice for Redux store
 * Manages user authentication state using NIP-07 browser extensions
 * Focuses on capabilities rather than specific extension brands
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, UserProfile, ExtensionCapabilities } from '@/types/auth'
import type { PublicKey } from '@/types'
import { detectNostrExtension, getPublicKey, hasNip07Support } from '@/utils/nip07'

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

/**
 * Detect and test NIP-07 extension capabilities
 */
export const detectExtension = createAsyncThunk(
  'auth/detectExtension',
  async (_, { rejectWithValue }) => {
    try {
      const detection = await detectNostrExtension()
      return detection
    } catch (error) {
      console.error('Extension detection failed:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Extension detection failed')
    }
  }
)

/**
 * Authenticate user with NIP-07 extension
 */
export const loginWithExtension = createAsyncThunk(
  'auth/loginWithExtension',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // First detect extension capabilities
      const detection = await detectNostrExtension()
      
      if (!detection.isAvailable) {
        throw new Error('No NIP-07 extension detected. Please install a Nostr extension like Alby, nos2x, or Flamingo.')
      }

      if (!detection.capabilities.getPublicKey) {
        throw new Error('Extension does not support getPublicKey')
      }

      // Update extension status in store
      dispatch(setExtension({
        available: detection.isAvailable,
        capabilities: detection.capabilities
      }))

      // Get public key from extension
      const publicKey = await getPublicKey()
      
      if (!publicKey) {
        throw new Error('Failed to get public key from extension')
      }

      // Create basic user profile (will be enhanced with metadata later)
      const userProfile: UserProfile = {
        pubkey: publicKey,
        name: `user_${publicKey.slice(0, 8)}`,
      }

      return {
        user: userProfile,
        publicKey,
      }
    } catch (error) {
      console.error('Login failed:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed')
    }
  }
)

/**
 * Check for extension on app startup
 */
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { dispatch }) => {
    try {
      // Wait a bit for extensions to load
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Detect extension
      await dispatch(detectExtension())
      
      // If extension is available and we have basic support, try to auto-login
      const hasSupport = hasNip07Support()
      if (hasSupport) {
        console.log('NIP-07 extension detected, checking authentication status...')
        // Note: We don't auto-login for privacy - user must explicitly connect
      }
    } catch (error) {
      console.warn('Auth initialization failed:', error)
    }
  }
)

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
      state.error = null
      state.isLoading = false
      // Keep extension info for future logins
    },
  },
  extraReducers: (builder) => {
    builder
      // Detect extension
      .addCase(detectExtension.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(detectExtension.fulfilled, (state, action) => {
        state.isLoading = false
        state.extensionAvailable = action.payload.isAvailable
        state.extensionCapabilities = action.payload.capabilities
      })
      .addCase(detectExtension.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.extensionAvailable = false
        state.extensionCapabilities = null
      })

      // Login with extension
      .addCase(loginWithExtension.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginWithExtension.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.publicKey = action.payload.publicKey
        state.isAuthenticated = true
      })
      .addCase(loginWithExtension.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false
      })
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
