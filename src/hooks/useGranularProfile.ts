/**
 * @fileoverview Enhanced profile hook with granular field-level loading states
 * Provides individual loading states for each profile field to enable
 * granular skeleton loading where some fields can show skeleton while others show data
 */

import { useMemo } from 'react'
import { useProfile } from './useProfile'
import type { PublicKey } from '@/types'
import type { UserProfile } from '@/types/auth'

/**
 * Granular profile field loading states
 */
interface GranularProfileLoading {
  /** Overall profile loading state */
  isLoading: boolean
  /** Individual field loading states */
  fields: {
    name: boolean
    username: boolean
    avatar: boolean
    bio: boolean
    nip05: boolean
    website: boolean
    lightningAddress: boolean
    banner: boolean
    verification: boolean
  }
}

/**
 * Granular profile data with field-level access
 */
interface GranularProfileData {
  /** Profile fields with fallback values */
  fields: {
    name: string
    username: string
    avatar: string | null
    bio: string | null
    nip05: string | null
    website: string | null
    lightningAddress: string | null
    banner: string | null
    isVerified: boolean
  }
  /** Raw profile object */
  profile: UserProfile | null
  /** Short pubkey for display */
  shortPubkey: string
}

/**
 * Enhanced profile hook return value
 */
interface UseGranularProfileReturn {
  /** Profile data with field-level access */
  data: GranularProfileData
  /** Granular loading states */
  loading: GranularProfileLoading
  /** Overall states */
  isLoading: boolean
  isStale: boolean
  error: string | null
  /** Actions */
  fetchProfile: () => Promise<void>
  refreshProfile: () => Promise<void>
}

/**
 * Enhanced profile hook with granular field-level loading states
 * Enables skeleton loading at the individual field level rather than entire profile
 * 
 * @param pubkey - Public key to load profile for
 * @param options - Profile loading options
 */
export function useGranularProfile(
  pubkey: PublicKey | null,
  options: {
    autoFetch?: boolean
    enableBatching?: boolean
  } = {}
): UseGranularProfileReturn {
  // Use the base profile hook
  const { 
    profile, 
    displayName, 
    avatarUrl, 
    verification, 
    lightning,
    isLoading: baseIsLoading,
    isStale,
    error,
    fetchProfile,
    refreshProfile
  } = useProfile(pubkey, {
    autoFetch: options.autoFetch ?? true,
    enableBatching: options.enableBatching ?? true
  })

  // Calculate granular loading states
  const loading: GranularProfileLoading = useMemo(() => {
    // If overall loading or no profile yet, all fields are loading
    if (baseIsLoading || !profile) {
      return {
        isLoading: true,
        fields: {
          name: true,
          username: true,
          avatar: true,
          bio: true,
          nip05: true,
          website: true,
          lightningAddress: true,
          banner: true,
          verification: true
        }
      }
    }

    // Profile exists but may have missing fields
    // In practice, for Nostr, once we have the profile event, we have all the data
    // But we can still check for specific field presence
    return {
      isLoading: false,
      fields: {
        name: false, // We always generate a fallback name
        username: false, // We always generate a fallback username
        avatar: !profile.picture && !avatarUrl, // Loading if no picture URL
        bio: false, // About field can be empty
        nip05: false, // NIP-05 can be empty
        website: false, // Website can be empty
        lightningAddress: false, // Lightning can be empty
        banner: false, // Banner can be empty
        verification: false // Verification is computed
      }
    }
  }, [baseIsLoading, profile, avatarUrl])

  // Calculate granular profile data
  const data: GranularProfileData = useMemo(() => {
    const shortPubkey = pubkey ? `${pubkey.slice(0, 8)}...${pubkey.slice(-4)}` : ''
    
    // If no profile yet, return fallback data
    if (!profile) {
      return {
        fields: {
          name: displayName,
          username: shortPubkey,
          avatar: avatarUrl,
          bio: null,
          nip05: null,
          website: null,
          lightningAddress: null,
          banner: null,
          isVerified: false
        },
        profile: null,
        shortPubkey
      }
    }

    // Extract all profile fields
    return {
      fields: {
        name: displayName,
        username: profile.name || shortPubkey,
        avatar: avatarUrl,
        bio: profile.about || null,
        nip05: profile.nip05 || null,
        website: profile.website || null,
        lightningAddress: lightning.lud16 || lightning.lud06 || null,
        banner: profile.banner || null,
        isVerified: verification.isVerified
      },
      profile,
      shortPubkey
    }
  }, [profile, displayName, avatarUrl, lightning, verification, pubkey])

  return {
    data,
    loading,
    isLoading: baseIsLoading,
    isStale,
    error,
    fetchProfile,
    refreshProfile
  }
}

/**
 * Hook for granular loading of multiple profiles
 * 
 * @deprecated This hook is not yet implemented and will return empty data structures.
 * @experimental This is a placeholder implementation that should not be used in production.
 * 
 * For multiple profile support, use individual useGranularProfile hooks or the base useProfiles hook instead.
 * 
 * TODO: Implement proper multiple profile granular loading with:
 * - Batch fetching of multiple profiles
 * - Individual loading states per profile
 * - Proper error handling per profile
 * - Memory optimization for large profile sets
 */
export function useGranularProfiles(pubkeys: PublicKey[]) {
  // DEVELOPMENT WARNING: This hook is not implemented and returns empty data
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'useGranularProfiles is not implemented and will return empty data structures. ' +
      'Use individual useGranularProfile hooks or the base useProfiles hook instead.'
    )
  }
  
  // TODO: Implement proper multiple profile granular loading
  // For now, return empty structure with clear indication of non-functionality
  return useMemo(() => ({
    profiles: {} as Record<PublicKey, UseGranularProfileReturn | null>,
    loadingStates: {} as Record<PublicKey, boolean>,
    isAnyLoading: false,
    isAllLoading: false,
    loadedCount: 0,
    totalCount: pubkeys.length,
    // Flag to indicate this is not implemented
    __experimental_notImplemented: true
  }), [pubkeys])
}

/**
 * Mapping function to translate data field names to loading field names
 * Ensures type safety when accessing loading states
 */
function getLoadingFieldKey(
  fieldName: keyof GranularProfileData['fields']
): keyof GranularProfileLoading['fields'] {
  // Map data field names to loading field names
  const fieldMapping: Record<
    keyof GranularProfileData['fields'], 
    keyof GranularProfileLoading['fields']
  > = {
    name: 'name',
    username: 'username',
    avatar: 'avatar',
    bio: 'bio',
    nip05: 'nip05',
    website: 'website',
    lightningAddress: 'lightningAddress',
    banner: 'banner',
    isVerified: 'verification' // Special mapping for verification field
  }
  
  return fieldMapping[fieldName]
}

/**
 * Hook for profile fields that might load at different times
 * Useful for progressive profile loading scenarios
 */
export function useProfileField<T>(
  pubkey: PublicKey | null,
  fieldName: keyof GranularProfileData['fields'],
  fallback?: T
): {
  value: T | string | boolean | null
  isLoading: boolean
  isEmpty: boolean
} {
  const { data, loading } = useGranularProfile(pubkey)
  
  return useMemo(() => {
    const fieldValue = data.fields[fieldName]
    // Use the mapping function to get the correct loading field key
    const loadingFieldKey = getLoadingFieldKey(fieldName)
    const isFieldLoading = loading.fields[loadingFieldKey]
    
    return {
      value: fieldValue ?? fallback ?? null,
      isLoading: isFieldLoading,
      isEmpty: !fieldValue && !isFieldLoading
    }
  }, [data.fields, loading.fields, fieldName, fallback])
}

/**
 * Utility hook for conditional skeleton rendering
 */
export function useSkeletonOr<T>(
  condition: boolean,
  skeleton: React.ReactNode,
  content: T
): React.ReactNode | T {
  return condition ? skeleton : content
} 