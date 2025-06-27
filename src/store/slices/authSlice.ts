/**
 * Authentication slice for Redux store
 * Manages user authentication state, extension detection, and user profile
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, UserProfile, ExtensionDetection } from '@/types/auth'
import { detectNostrExtension, getPublicKey } from '@/utils/nip07'

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  publicKey: null,
  extensionType: null,
  extensionConnected: false,
  isLoading: false,
  error: null,
}

// Async thunks
export const detectExtension = createAsyncThunk(
  'auth/detectExtension',
  async (_, { rejectWithValue }) => {
    try {
      const detection = await detectNostrExtension()
      return detection
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to detect extension')
    }
  }
)

export const authenticateUser = createAsyncThunk(
  'auth/authenticateUser',
  async (_, { rejectWithValue }) => {
    try {
      const pubkey = await getPublicKey()
      if (!pubkey) {
        throw new Error('Failed to get public key from extension')
      }

      // In a real app, you would fetch user profile here
      // For now, we'll create a basic profile
      const userProfile: UserProfile = {
        pubkey,
        name: `User ${pubkey.slice(0, 8)}`,
        display_name: `User ${pubkey.slice(0, 8)}`,
      }

      return { pubkey, userProfile }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Authentication failed')
    }
  }
)

// Auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous actions
    logout: state => {
      state.isAuthenticated = false
      state.user = null
      state.publicKey = null
      state.error = null
    },
    clearError: state => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload
    },
    setExtensionConnected: (state, action: PayloadAction<boolean>) => {
      state.extensionConnected = action.payload
    },
  },
  extraReducers: builder => {
    // Handle extension detection
    builder
      .addCase(detectExtension.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(detectExtension.fulfilled, (state, action: PayloadAction<ExtensionDetection>) => {
        state.isLoading = false
        state.extensionType = action.payload.type
        state.extensionConnected = action.payload.isAvailable
      })
      .addCase(detectExtension.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.extensionConnected = false
      })

    // Handle user authentication
    builder
      .addCase(authenticateUser.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(authenticateUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.publicKey = action.payload.pubkey
        state.user = action.payload.userProfile
      })
      .addCase(authenticateUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.publicKey = null
        state.user = null
      })
  },
})

// Export actions
export const { logout, clearError, setUser, setExtensionConnected } = authSlice.actions

// Export reducer as default
export default authSlice.reducer
