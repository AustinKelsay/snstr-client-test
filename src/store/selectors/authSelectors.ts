/**
 * Selectors for authentication state
 * Provides memoized selectors for accessing auth state from the Redux store
 */

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'

// Base selectors
export const selectAuthState = (state: RootState) => state.auth

// Memoized selectors
export const selectIsAuthenticated = createSelector([selectAuthState], auth => auth.isAuthenticated)

export const selectUser = createSelector([selectAuthState], auth => auth.user)

export const selectPublicKey = createSelector([selectAuthState], auth => auth.publicKey)

export const selectExtensionType = createSelector([selectAuthState], auth => auth.extensionType)

export const selectExtensionConnected = createSelector(
  [selectAuthState],
  auth => auth.extensionConnected
)

export const selectAuthLoading = createSelector([selectAuthState], auth => auth.isLoading)

export const selectAuthError = createSelector([selectAuthState], auth => auth.error)

// Computed selectors
export const selectUserDisplayName = createSelector([selectUser], user => {
  if (!user) return null
  return user.display_name || user.name || `User ${user.pubkey.slice(0, 8)}`
})

export const selectUserAvatar = createSelector([selectUser], user => user?.picture || null)

export const selectIsExtensionAvailable = createSelector(
  [selectExtensionConnected, selectExtensionType],
  (connected, type) => connected && type !== null
)

export const selectAuthStatus = createSelector(
  [selectIsAuthenticated, selectExtensionConnected, selectAuthLoading],
  (isAuthenticated, extensionConnected, isLoading) => {
    if (isLoading) return 'loading'
    if (!extensionConnected) return 'no-extension'
    if (!isAuthenticated) return 'unauthenticated'
    return 'authenticated'
  }
)

// Combined selectors for components
export const selectAuthInfo = createSelector(
  [selectIsAuthenticated, selectUser, selectPublicKey, selectExtensionType],
  (isAuthenticated, user, publicKey, extensionType) => ({
    isAuthenticated,
    user,
    publicKey,
    extensionType,
  })
)
