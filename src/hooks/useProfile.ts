/**
 * @fileoverview Custom hook for profile management
 * Provides a clean API for components to fetch and use profile data
 * Handles caching, loading states, and automatic profile updates
 */

import { useEffect, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  fetchProfile,
  fetchProfilesBatch,
  subscribeToProfiles,
  queueProfileForBatch
} from '@/store/slices/profilesSlice'
import {
  selectProfileByPubkey,
  selectProfilesByPubkeys,
  selectIsProfileLoading,
  selectProfileDisplayName,
  selectProfileAvatar,
  selectProfileVerification,
  selectProfileLightning,
  selectIsProfileStale,
  selectProfilesNeedingFetch,
  selectLoadingStatesByPubkeys
} from '@/store/selectors/profilesSelectors'
import type { UserProfile } from '@/types/auth'
import type { PublicKey } from '@/types'

/**
 * Profile hook options
 */
interface UseProfileOptions {
  /** Whether to fetch profile automatically */
  autoFetch?: boolean
  /** Whether to subscribe to real-time updates */
  subscribe?: boolean
  /** Whether to use batch loading for efficiency */
  enableBatching?: boolean
}

/**
 * Profile hook return value
 */
interface UseProfileReturn {
  /** Profile data */
  profile: UserProfile | null
  /** Display name with fallback logic */
  displayName: string
  /** Avatar URL */
  avatarUrl: string | null
  /** Verification status */
  verification: { isVerified: boolean; nip05: string | null }
  /** Lightning payment info */
  lightning: { lud16: string | null; lud06: string | null; hasLightning: boolean }
  /** Loading state */
  isLoading: boolean
  /** Whether profile needs refresh */
  isStale: boolean
  /** Error state */
  error: string | null
  /** Manually fetch profile */
  fetchProfile: () => Promise<void>
  /** Refresh profile (force fetch) */
  refreshProfile: () => Promise<void>
}

/**
 * Hook for managing a single profile
 */
export function useProfile(
  pubkey: PublicKey | null,
  options: UseProfileOptions = {}
): UseProfileReturn {
  const {
    autoFetch = true,
    subscribe = false,
    enableBatching = false
  } = options

  const dispatch = useAppDispatch()

  // Select profile data and states
  const profile = useAppSelector(state => 
    pubkey ? selectProfileByPubkey(state, pubkey) : null
  )
  const isLoading = useAppSelector(state => 
    pubkey ? selectIsProfileLoading(state, pubkey) : false
  )
  const isStale = useAppSelector(state => 
    pubkey ? selectIsProfileStale(state, pubkey) : false
  )

  // Select computed values
  const displayName = useAppSelector(state => 
    pubkey ? selectProfileDisplayName(state, pubkey) : 'Unknown User'
  )
  const avatarUrl = useAppSelector(state => 
    pubkey ? selectProfileAvatar(state, pubkey) : null
  )
  const verification = useAppSelector(state => 
    pubkey ? selectProfileVerification(state, pubkey) : { isVerified: false, nip05: null }
  )
  const lightning = useAppSelector(state => 
    pubkey ? selectProfileLightning(state, pubkey) : { lud16: null, lud06: null, hasLightning: false }
  )

  // Fetch profile manually
  const fetchProfileManual = useCallback(async () => {
    if (!pubkey) return
    
    if (enableBatching) {
      dispatch(queueProfileForBatch(pubkey))
    } else {
      await dispatch(fetchProfile(pubkey))
    }
  }, [pubkey, enableBatching, dispatch])

  // Refresh profile (force fetch)
  const refreshProfile = useCallback(async () => {
    if (!pubkey) return
    // Always use direct fetch for refresh to bypass cache
    await dispatch(fetchProfile(pubkey))
  }, [pubkey, dispatch])

  // Auto-fetch profile on mount or pubkey change
  useEffect(() => {
    if (pubkey && autoFetch && (isStale || !profile)) {
      fetchProfileManual()
    }
  }, [pubkey, autoFetch, isStale, profile, fetchProfileManual])

  // Subscribe to real-time updates
  useEffect(() => {
    if (pubkey && subscribe) {
      dispatch(subscribeToProfiles([pubkey]))
    }
  }, [pubkey, subscribe, dispatch])

  return {
    profile,
    displayName,
    avatarUrl,
    verification,
    lightning,
    isLoading,
    isStale,
    error: null, // TODO: Add error handling from selectors
    fetchProfile: fetchProfileManual,
    refreshProfile
  }
}

/**
 * Multiple profiles hook options
 */
interface UseProfilesOptions {
  /** Whether to fetch profiles automatically */
  autoFetch?: boolean
  /** Whether to subscribe to real-time updates */
  subscribe?: boolean
  /** Maximum number of profiles to fetch in a single batch */
  batchSize?: number
}

/**
 * Multiple profiles hook return value
 */
interface UseProfilesReturn {
  /** Profiles data by pubkey */
  profiles: Record<PublicKey, UserProfile | null>
  /** Loading states by pubkey */
  loadingStates: Record<PublicKey, boolean>
  /** Whether any profiles are loading */
  isLoading: boolean
  /** Profiles that need fetching */
  needsFetch: PublicKey[]
  /** Fetch all missing/stale profiles */
  fetchProfiles: () => Promise<void>
  /** Refresh all profiles */
  refreshProfiles: () => Promise<void>
}

/**
 * Hook for managing multiple profiles efficiently
 */
export function useProfiles(
  pubkeys: PublicKey[],
  options: UseProfilesOptions = {}
): UseProfilesReturn {
  const {
    autoFetch = true,
    subscribe = false,
    batchSize = 20
  } = options

  const dispatch = useAppDispatch()

  // Select profiles data
  const profiles = useAppSelector(state => 
    selectProfilesByPubkeys(state, pubkeys)
  )

  // Select profiles that need fetching
  const needsFetch = useAppSelector(state => 
    selectProfilesNeedingFetch(state, pubkeys)
  )

  // Calculate loading states
  const loadingStates = useAppSelector(state => 
    selectLoadingStatesByPubkeys(state, pubkeys)
  )

  const isLoading = useMemo(() => 
    Object.values(loadingStates).some(Boolean),
    [loadingStates]
  )

  // Fetch profiles in batches
  const fetchProfiles = useCallback(async () => {
    if (needsFetch.length === 0) return

    // Split into batches
    const batches = []
    for (let i = 0; i < needsFetch.length; i += batchSize) {
      batches.push(needsFetch.slice(i, i + batchSize))
    }

    // Fetch each batch
    for (const batch of batches) {
      await dispatch(fetchProfilesBatch(batch))
    }
  }, [needsFetch, batchSize, dispatch])

  // Refresh all profiles
  const refreshProfiles = useCallback(async () => {
    // Fetch all profiles in batches, ignoring cache
    const batches = []
    for (let i = 0; i < pubkeys.length; i += batchSize) {
      batches.push(pubkeys.slice(i, i + batchSize))
    }

    for (const batch of batches) {
      await dispatch(fetchProfilesBatch(batch))
    }
  }, [pubkeys, batchSize, dispatch])

  // Auto-fetch missing profiles
  useEffect(() => {
    if (autoFetch && needsFetch.length > 0) {
      fetchProfiles()
    }
  }, [autoFetch, needsFetch.length, fetchProfiles])

  // Subscribe to real-time updates
  useEffect(() => {
    if (subscribe && pubkeys.length > 0) {
      dispatch(subscribeToProfiles(pubkeys))
    }
  }, [subscribe, pubkeys, dispatch])

  return {
    profiles,
    loadingStates,
    isLoading,
    needsFetch,
    fetchProfiles,
    refreshProfiles
  }
}

/**
 * Hook for getting profile display information with fallbacks
 */
export function useProfileDisplay(pubkey: PublicKey | null) {
  const { profile, displayName, avatarUrl, verification } = useProfile(pubkey, {
    autoFetch: true,
    enableBatching: true
  })

  return useMemo(() => ({
    name: displayName,
    avatar: avatarUrl,
    isVerified: verification.isVerified,
    nip05: verification.nip05,
    shortPubkey: pubkey ? `${pubkey.slice(0, 8)}...${pubkey.slice(-4)}` : '',
    hasProfile: Boolean(profile)
  }), [displayName, avatarUrl, verification, pubkey, profile])
}

/**
 * Hook for profile avatar with loading placeholder
 */
export function useProfileAvatar(pubkey: PublicKey | null) {
  const { avatarUrl, isLoading } = useProfile(pubkey, {
    autoFetch: true,
    enableBatching: true
  })

  return useMemo(() => ({
    src: avatarUrl,
    isLoading,
    fallback: `https://api.dicebear.com/7.x/identicon/svg?seed=${pubkey || 'default'}`
  }), [avatarUrl, isLoading, pubkey])
} 