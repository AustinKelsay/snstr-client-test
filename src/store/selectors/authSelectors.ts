/**
 * Authentication selectors for Redux store
 * Provides memoized selectors for auth state access
 * Updated to use capability-based extension detection per NIP-07 standards
 */

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

// Base selector
const selectAuthState = (state: RootState) => state.auth

// Basic auth selectors
export const selectIsAuthenticated = createSelector([selectAuthState], auth => auth.isAuthenticated)

export const selectUser = createSelector([selectAuthState], auth => auth.user)

export const selectPublicKey = createSelector([selectAuthState], auth => auth.publicKey)

export const selectAuthLoading = createSelector([selectAuthState], auth => auth.isLoading)

export const selectAuthError = createSelector([selectAuthState], auth => auth.error)

// Extension-related selectors (capability-based)
export const selectExtensionAvailable = createSelector(
  [selectAuthState], 
  auth => auth.extensionAvailable
)

export const selectExtensionCapabilities = createSelector(
  [selectAuthState], 
  auth => auth.extensionCapabilities
)

// Capability-specific selectors
export const selectCanGetPublicKey = createSelector(
  [selectExtensionCapabilities],
  capabilities => capabilities?.getPublicKey ?? false
)

export const selectCanSignEvent = createSelector(
  [selectExtensionCapabilities],
  capabilities => capabilities?.signEvent ?? false
)

export const selectCanGetRelays = createSelector(
  [selectExtensionCapabilities],
  capabilities => capabilities?.getRelays ?? false
)

export const selectHasNip04Support = createSelector(
  [selectExtensionCapabilities],
  capabilities => capabilities?.nip04 ?? false
)

export const selectHasNip44Support = createSelector(
  [selectExtensionCapabilities],
  capabilities => capabilities?.nip44 ?? false
)

// Composite selectors
export const selectHasBasicNip07Support = createSelector(
  [selectCanGetPublicKey, selectCanSignEvent],
  (canGetPublicKey, canSignEvent) => canGetPublicKey && canSignEvent
)

export const selectCanEncrypt = createSelector(
  [selectHasNip04Support, selectHasNip44Support],
  (hasNip04, hasNip44) => hasNip04 || hasNip44
)

export const selectExtensionStatus = createSelector(
  [selectExtensionAvailable, selectExtensionCapabilities],
  (available, capabilities) => ({
    available,
    capabilities,
    hasBasicSupport: capabilities?.getPublicKey && capabilities?.signEvent,
    canEncrypt: capabilities?.nip04 || capabilities?.nip44,
  })
)

// Combined auth status selector
export const selectAuthStatus = createSelector(
  [selectIsAuthenticated, selectUser, selectPublicKey, selectExtensionAvailable],
  (isAuthenticated, user, publicKey, extensionAvailable) => ({
    isAuthenticated,
    user,
    publicKey,
    extensionAvailable,
    readyToUse: isAuthenticated && extensionAvailable,
  })
)
