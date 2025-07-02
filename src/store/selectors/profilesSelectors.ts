/**
 * @fileoverview Profile selectors for Redux store
 * Provides memoized selectors for accessing profile state efficiently
 * Includes computed selectors for profile loading states and cached data
 */

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { UserProfile } from '@/types/auth'
import type { PublicKey } from '@/types'

/**
 * Base selector for profiles state
 */
const selectProfilesState = (state: RootState) => state.profiles

/**
 * Select all cached profiles
 */
export const selectAllProfiles = createSelector(
  [selectProfilesState],
  (profiles) => profiles.profiles
)

/**
 * Select profile by public key
 */
export const selectProfileByPubkey = createSelector(
  [selectAllProfiles, (state: RootState, pubkey: PublicKey) => pubkey],
  (profiles, pubkey) => profiles[pubkey]?.profile || null
)

/**
 * Select multiple profiles by public keys
 */
export const selectProfilesByPubkeys = createSelector(
  [selectAllProfiles, (state: RootState, pubkeys: PublicKey[]) => pubkeys],
  (profiles, pubkeys) => {
    const result: Record<PublicKey, UserProfile | null> = {}
    pubkeys.forEach(pubkey => {
      result[pubkey] = profiles[pubkey]?.profile || null
    })
    return result
  }
)

/**
 * Check if profile is loading by public key
 */
export const selectIsProfileLoading = createSelector(
  [selectProfilesState, (state: RootState, pubkey: PublicKey) => pubkey],
  (profiles, pubkey) => Boolean(profiles.loading[pubkey]?.isLoading)
)

/**
 * Check if any profiles are loading
 */
export const selectAreProfilesLoading = createSelector(
  [selectProfilesState],
  (profiles) => Object.keys(profiles.loading).length > 0 || profiles.isLoadingBatch
)

/**
 * Select batch loading state
 */
export const selectIsBatchLoading = createSelector(
  [selectProfilesState],
  (profiles) => profiles.isLoadingBatch
)

/**
 * Select profiles loading queue
 */
export const selectBatchQueue = createSelector(
  [selectProfilesState],
  (profiles) => profiles.batchQueue
)

/**
 * Select profiles error
 */
export const selectProfilesError = createSelector(
  [selectProfilesState],
  (profiles) => profiles.error
)

/**
 * Select active profile subscriptions
 */
export const selectProfileSubscriptions = createSelector(
  [selectProfilesState],
  (profiles) => profiles.subscriptions
)

/**
 * Check if profile exists in cache (regardless of loading state)
 */
export const selectHasProfile = createSelector(
  [selectAllProfiles, (state: RootState, pubkey: PublicKey) => pubkey],
  (profiles, pubkey) => Boolean(profiles[pubkey])
)

/**
 * Check if profile is stale and needs refresh
 */
export const selectIsProfileStale = createSelector(
  [selectAllProfiles, (state: RootState, pubkey: PublicKey) => pubkey],
  (profiles, pubkey) => {
    const entry = profiles[pubkey]
    if (!entry) return true
    
    const now = Date.now()
    const CACHE_EXPIRATION = 5 * 60 * 1000 // 5 minutes
    return (now - entry.lastFetched * 1000) > CACHE_EXPIRATION || entry.isStale
  }
)

/**
 * Get profile display name with fallback logic
 */
export const selectProfileDisplayName = createSelector(
  [selectAllProfiles, (state: RootState, pubkey: PublicKey) => pubkey],
  (profiles, pubkey) => {
    const profile = profiles[pubkey]?.profile
    if (!profile) return 'Unknown User'
    
    // Priority: display_name > name > shortened pubkey
    return profile.display_name || 
           profile.name || 
           `${profile.pubkey.slice(0, 8)}...${profile.pubkey.slice(-4)}`
  }
)

/**
 * Get profile avatar URL with fallback
 */
export const selectProfileAvatar = createSelector(
  [selectAllProfiles, (state: RootState, pubkey: PublicKey) => pubkey],
  (profiles, pubkey) => {
    const profile = profiles[pubkey]?.profile
    return profile?.picture || null
  }
)

/**
 * Get profile verification status (NIP-05)
 */
export const selectProfileVerification = createSelector(
  [selectAllProfiles, (state: RootState, pubkey: PublicKey) => pubkey],
  (profiles, pubkey) => {
    const profile = profiles[pubkey]?.profile
    return {
      isVerified: Boolean(profile?.nip05),
      nip05: profile?.nip05 || null
    }
  }
)

/**
 * Get profile Lightning addresses
 */
export const selectProfileLightning = createSelector(
  [selectAllProfiles, (state: RootState, pubkey: PublicKey) => pubkey],
  (profiles, pubkey) => {
    const profile = profiles[pubkey]?.profile
    return {
      lud16: profile?.lud16 || null,
      lud06: profile?.lud06 || null,
      hasLightning: Boolean(profile?.lud16 || profile?.lud06)
    }
  }
)

/**
 * Get profile cache stats for debugging
 */
export const selectProfileCacheStats = createSelector(
  [selectProfilesState],
  (profiles) => {
    const totalProfiles = Object.keys(profiles.profiles).length
    const loadingCount = Object.keys(profiles.loading).length
    const queueSize = profiles.batchQueue.length
    const subscriptionCount = Object.keys(profiles.subscriptions).length

    return {
      totalProfiles,
      loadingCount,
      queueSize,
      subscriptionCount,
      hasError: Boolean(profiles.error)
    }
  }
)

/**
 * Select profiles that need to be fetched (missing or stale)
 */
export const selectProfilesNeedingFetch = createSelector(
  [selectAllProfiles, (state: RootState, pubkeys: PublicKey[]) => pubkeys],
  (profiles, pubkeys) => {
    const now = Date.now()
    const CACHE_EXPIRATION = 5 * 60 * 1000 // 5 minutes
    
    return pubkeys.filter(pubkey => {
      const entry = profiles[pubkey]
      if (!entry) return true
      
      return (now - entry.lastFetched * 1000) > CACHE_EXPIRATION || entry.isStale
    })
  }
)

/**
 * Select loading states for multiple profiles by public keys
 */
export const selectLoadingStatesByPubkeys = createSelector(
  [selectProfilesState, (state: RootState, pubkeys: PublicKey[]) => pubkeys],
  (profiles, pubkeys) => {
    const states: Record<PublicKey, boolean> = {}
    pubkeys.forEach(pubkey => {
      states[pubkey] = Boolean(profiles.loading[pubkey]?.isLoading)
    })
    return states
  }
)

/**
 * Create a factory function for profile selectors with default values
 */
export const createProfileSelector = (defaultProfile?: Partial<UserProfile>) =>
  createSelector(
    [selectProfileByPubkey],
    (profile) => profile ? { ...defaultProfile, ...profile } : null
  ) 