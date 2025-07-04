/**
 * @fileoverview Profiles slice for Redux store
 * Manages user profile metadata with efficient caching and real-time updates
 * Handles NIP-01 kind 0 events for user metadata (names, avatars, bios)
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { UserProfile } from '@/types/auth'
import type { PublicKey, Timestamp } from '@/types'
import type { NostrEvent } from 'snstr'
import { nostrClient } from '@/features/nostr/nostrClient'
import { PROFILE_CACHE_EXPIRATION_SECONDS } from '@/constants/cache'

/**
 * Profile cache entry with metadata
 */
interface ProfileCacheEntry {
  profile: UserProfile
  lastFetched: Timestamp
  lastUpdated: Timestamp
  isStale: boolean
  fetchAttempts: number
}

/**
 * Profile loading state
 */
interface ProfileLoadingState {
  isLoading: boolean
  requestedAt: Timestamp
}

/**
 * Profiles state interface
 */
export interface ProfilesState {
  /** Cached profiles by pubkey */
  profiles: Record<PublicKey, ProfileCacheEntry>
  /** Currently loading profiles */
  loading: Record<PublicKey, ProfileLoadingState>
  /** Batch loading queue */
  batchQueue: PublicKey[]
  /** Active profile subscriptions */
  subscriptions: Record<string, PublicKey[]>
  /** Global loading state */
  isLoadingBatch: boolean
  /** Last error */
  error: string | null
}

/**
 * Initial state
 */
const initialState: ProfilesState = {
  profiles: {},
  loading: {},
  batchQueue: [],
  subscriptions: {},
  isLoadingBatch: false,
  error: null,
}



/**
 * Maximum batch size for profile requests
 */
const MAX_BATCH_SIZE = 20

/**
 * Maximum fetch attempts before giving up
 */
const MAX_FETCH_ATTEMPTS = 3

/**
 * Validate and sanitize profile metadata from kind 0 event
 */
function validateProfileMetadata(content: string): Partial<UserProfile> | null {
  try {
    const metadata = JSON.parse(content)
    
    if (typeof metadata !== 'object' || metadata === null) {
      return null
    }

    // Sanitize and validate each field
    const sanitized: Partial<UserProfile> = {}

    if (typeof metadata.name === 'string' && metadata.name.length <= 100) {
      sanitized.name = metadata.name.trim()
    }

    if (typeof metadata.display_name === 'string' && metadata.display_name.length <= 100) {
      sanitized.display_name = metadata.display_name.trim()
    }

    if (typeof metadata.about === 'string' && metadata.about.length <= 500) {
      sanitized.about = metadata.about.trim()
    }

    // Validate URLs for security
    if (typeof metadata.picture === 'string' && isValidImageUrl(metadata.picture)) {
      sanitized.picture = metadata.picture.trim()
    }

    if (typeof metadata.banner === 'string' && isValidImageUrl(metadata.banner)) {
      sanitized.banner = metadata.banner.trim()
    }

    if (typeof metadata.website === 'string' && isValidUrl(metadata.website)) {
      sanitized.website = metadata.website.trim()
    }

    if (typeof metadata.nip05 === 'string' && isValidNip05(metadata.nip05)) {
      sanitized.nip05 = metadata.nip05.trim()
    }

    if (typeof metadata.lud16 === 'string' && isValidLightningAddress(metadata.lud16)) {
      sanitized.lud16 = metadata.lud16.trim()
    }

    if (typeof metadata.lud06 === 'string' && metadata.lud06.length <= 200) {
      sanitized.lud06 = metadata.lud06.trim()
    }

    return sanitized
  } catch (error) {
    console.warn('Failed to parse profile metadata:', error)
    return null
  }
}

/**
 * Validate image URL for security
 * Only accepts HTTPS URLs to prevent mixed content warnings and security issues
 */
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && 
           url.length <= 500 &&
           !url.includes('<') && !url.includes('>')
  } catch {
    return false
  }
}

/**
 * Validate general URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return url.length <= 500 && !url.includes('<') && !url.includes('>')
  } catch {
    return false
  }
}

/**
 * Validate NIP-05 identifier
 */
function isValidNip05(nip05: string): boolean {
  const nip05Regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return nip05Regex.test(nip05) && nip05.length <= 100
}

/**
 * Validate Lightning address (LUD-16)
 */
function isValidLightningAddress(address: string): boolean {
  // Lightning addresses follow email format
  return isValidNip05(address)
}

/**
 * Convert NostrEvent to UserProfile
 */
function convertEventToProfile(event: NostrEvent): UserProfile | null {
  if (event.kind !== 0) return null

  const metadata = validateProfileMetadata(event.content)
  if (!metadata) return null

  return {
    pubkey: event.pubkey,
    ...metadata,
  }
}

/**
 * Check if profile is stale and needs refresh
 */
function isProfileStale(entry: ProfileCacheEntry): boolean {
  const now = Date.now() / 1000 // Convert to seconds to match lastFetched
  return (now - entry.lastFetched) > PROFILE_CACHE_EXPIRATION_SECONDS || entry.isStale
}

/**
 * Fetch a single profile by pubkey
 */
export const fetchProfile = createAsyncThunk(
  'profiles/fetchProfile',
  async (pubkey: PublicKey, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { profiles: ProfilesState }
      const existing = state.profiles.profiles[pubkey]

      // Skip if recently fetched and not stale
      if (existing && !isProfileStale(existing)) {
        return existing.profile
      }

      // Skip if too many failed attempts
      if (existing && existing.fetchAttempts >= MAX_FETCH_ATTEMPTS) {
        return rejectWithValue('Max fetch attempts exceeded')
      }

      // Fetch latest kind 0 event for this pubkey
      const events = await nostrClient.fetchEvents([{
        kinds: [0],
        authors: [pubkey],
        limit: 1
      }], {
        maxWait: 3000,
        deduplicate: true
      })

      if (events.length === 0) {
        return rejectWithValue('No profile found')
      }

      // Get the most recent event
      const latestEvent = events.sort((a, b) => b.created_at - a.created_at)[0]
      const profile = convertEventToProfile(latestEvent)

      if (!profile) {
        return rejectWithValue('Invalid profile metadata')
      }

      return {
        pubkey,
        profile,
        timestamp: Date.now() / 1000
      }
    } catch (error) {
      console.error(`Failed to fetch profile for ${pubkey}:`, error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profile')
    }
  }
)

/**
 * Batch fetch multiple profiles efficiently
 */
export const fetchProfilesBatch = createAsyncThunk(
  'profiles/fetchProfilesBatch',
  async (pubkeys: PublicKey[], { getState, rejectWithValue }) => {
    try {
      const state = getState() as { profiles: ProfilesState }
      
      // Filter out profiles that are already cached and fresh
      const needsFetch = pubkeys.filter(pubkey => {
        const existing = state.profiles.profiles[pubkey]
        return !existing || isProfileStale(existing)
      })

      if (needsFetch.length === 0) {
        return { profiles: [], timestamp: Date.now() / 1000 }
      }

      // Batch fetch with size limit
      const batches = []
      for (let i = 0; i < needsFetch.length; i += MAX_BATCH_SIZE) {
        batches.push(needsFetch.slice(i, i + MAX_BATCH_SIZE))
      }

      const allProfiles: Array<{ pubkey: PublicKey; profile: UserProfile }> = []

      for (const batch of batches) {
        // Fetch latest kind 0 events for this batch
        const events = await nostrClient.fetchEvents([{
          kinds: [0],
          authors: batch,
          limit: batch.length
        }], {
          maxWait: 5000,
          deduplicate: true
        })

        // Group events by pubkey and get latest for each
        const eventsByPubkey = new Map<PublicKey, NostrEvent>()
        
        events.forEach(event => {
          const existing = eventsByPubkey.get(event.pubkey)
          if (!existing || event.created_at > existing.created_at) {
            eventsByPubkey.set(event.pubkey, event)
          }
        })

        // Convert events to profiles
        eventsByPubkey.forEach((event, pubkey) => {
          const profile = convertEventToProfile(event)
          if (profile) {
            allProfiles.push({ pubkey, profile })
          }
        })
      }

      return {
        profiles: allProfiles,
        timestamp: Date.now() / 1000
      }
    } catch (error) {
      console.error('Failed to fetch profiles batch:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profiles')
    }
  }
)

/**
 * Subscribe to profile updates for a list of pubkeys
 * Uses batched subscriptions to avoid rate limiting
 */
export const subscribeToProfiles = createAsyncThunk(
  'profiles/subscribeToProfiles',
  async (pubkeys: PublicKey[], { dispatch }) => {
    try {
      console.log(`📡 Subscribing to ${pubkeys.length} profiles using batched subscriptions`)
      
      // Use batched profile subscriptions to avoid rate limiting
      const subscriptionIds = nostrClient.subscribeToBatchedProfiles(
        pubkeys,
        (event) => {
          // Handle real-time profile updates
          const profile = convertEventToProfile(event)
          if (profile) {
            dispatch(updateProfileFromEvent({
              pubkey: event.pubkey,
              profile,
              timestamp: event.created_at
            }))
          }
        },
        {
          autoClose: false, // Keep subscriptions open for real-time updates
          eoseTimeout: 15000 // Wait up to 15 seconds for stored events
        }
      )

      return {
        subscriptionIds, // Return array of subscription IDs
        pubkeys,
        timestamp: Date.now() / 1000
      }
    } catch (error) {
      console.error('Failed to subscribe to profiles:', error)
      throw error
    }
  }
)

/**
 * Profiles slice
 */
export const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    /**
     * Add pubkey to batch loading queue
     */
    queueProfileForBatch: (state, action: PayloadAction<PublicKey>) => {
      if (!state.batchQueue.includes(action.payload)) {
        state.batchQueue.push(action.payload)
      }
    },

    /**
     * Clear batch queue
     */
    clearBatchQueue: (state) => {
      state.batchQueue = []
    },

    /**
     * Update profile from real-time event
     */
    updateProfileFromEvent: (state, action: PayloadAction<{
      pubkey: PublicKey
      profile: UserProfile
      timestamp: Timestamp
    }>) => {
      const { pubkey, profile, timestamp } = action.payload
      const existing = state.profiles[pubkey]

      // Only update if this event is newer
      if (!existing || timestamp > existing.lastUpdated) {
        state.profiles[pubkey] = {
          profile,
          lastFetched: Date.now() / 1000,
          lastUpdated: timestamp,
          isStale: false,
          fetchAttempts: 0
        }
      }
    },

    /**
     * Mark profile as stale
     */
    markProfileStale: (state, action: PayloadAction<PublicKey>) => {
      const profile = state.profiles[action.payload]
      if (profile) {
        profile.isStale = true
      }
    },

    /**
     * Clear all profiles
     */
    clearProfiles: (state) => {
      state.profiles = {}
      state.loading = {}
      state.batchQueue = []
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch single profile
      .addCase(fetchProfile.pending, (state, action) => {
        const pubkey = action.meta.arg
        state.loading[pubkey] = {
          isLoading: true,
          requestedAt: Date.now() / 1000
        }
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        const pubkey = action.meta.arg
        const result = action.payload

        if (typeof result === 'object' && 'profile' in result) {
          state.profiles[pubkey] = {
            profile: result.profile,
            lastFetched: result.timestamp,
            lastUpdated: result.timestamp,
            isStale: false,
            fetchAttempts: 0
          }
        }

        delete state.loading[pubkey]
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        const pubkey = action.meta.arg
        const existing = state.profiles[pubkey]
        
        if (existing) {
          existing.fetchAttempts += 1
        } else {
          // Create empty entry to track failed attempts
          state.profiles[pubkey] = {
            profile: { pubkey },
            lastFetched: Date.now() / 1000,
            lastUpdated: 0,
            isStale: true,
            fetchAttempts: 1
          }
        }

        delete state.loading[pubkey]
        state.error = action.payload as string
      })

      // Batch fetch profiles
      .addCase(fetchProfilesBatch.pending, (state) => {
        state.isLoadingBatch = true
        state.error = null
      })
      .addCase(fetchProfilesBatch.fulfilled, (state, action) => {
        const { profiles, timestamp } = action.payload

        profiles.forEach(({ pubkey, profile }) => {
          state.profiles[pubkey] = {
            profile,
            lastFetched: timestamp,
            lastUpdated: timestamp,
            isStale: false,
            fetchAttempts: 0
          }
        })

        state.isLoadingBatch = false
        state.batchQueue = []
      })
      .addCase(fetchProfilesBatch.rejected, (state, action) => {
        state.isLoadingBatch = false
        state.error = action.payload as string
      })

      // Subscribe to profiles
      .addCase(subscribeToProfiles.fulfilled, (state, action) => {
        const { subscriptionIds, pubkeys } = action.payload
        // Store all subscription IDs for this batch of pubkeys
        subscriptionIds.forEach(subscriptionId => {
          state.subscriptions[subscriptionId] = pubkeys
        })
      })
  }
})

// Export actions
export const {
  queueProfileForBatch,
  clearBatchQueue,
  updateProfileFromEvent,
  markProfileStale,
  clearProfiles,
  clearError
} = profilesSlice.actions

// Export reducer
export default profilesSlice.reducer 