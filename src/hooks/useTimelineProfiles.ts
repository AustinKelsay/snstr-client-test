/**
 * @fileoverview Hook for automatically loading profiles from timeline posts
 * Ensures that all post authors have their profile data fetched efficiently
 * Uses batch loading to minimize relay requests and avoid rate limiting
 */

import { useMemo } from 'react'
import { useProfiles } from './useProfile'
import type { Post, PublicKey } from '@/types'

/**
 * Options for timeline profile loading
 */
interface UseTimelineProfilesOptions {
  /** Whether to automatically fetch missing profiles */
  autoFetch?: boolean
  /** Whether to subscribe to real-time profile updates */
  subscribe?: boolean
  /** Maximum number of profiles to track */
  maxProfiles?: number
}

/**
 * Hook for automatically loading profiles from timeline posts
 * Extracts unique pubkeys from posts and ensures they're all loaded
 * 
 * @param posts Array of posts to extract authors from
 * @param options Configuration options
 * @returns Profile loading state and utilities
 */
export function useTimelineProfiles(
  posts: Post[],
  options: UseTimelineProfilesOptions = {}
) {
  const {
    autoFetch = true,
    subscribe = true,
    maxProfiles = 100
  } = options

  // Extract unique pubkeys from posts with debouncing
  const pubkeys = useMemo(() => {
    const uniquePubkeys = new Set<PublicKey>()
    
    posts.forEach(post => {
      uniquePubkeys.add(post.pubkey)
      
      // Also add any mentioned users from tags
      post.tags?.forEach(tag => {
        if (tag[0] === 'p' && tag[1]) {
          uniquePubkeys.add(tag[1])
        }
      })
    })
    
    // Limit to maxProfiles to avoid overwhelming the system
    return Array.from(uniquePubkeys).slice(0, maxProfiles)
  }, [posts, maxProfiles])

  // Use the profiles hook to manage loading with larger batch size
  const profilesResult = useProfiles(pubkeys, {
    autoFetch,
    subscribe,
    batchSize: 100 // Increased from 50 to reduce number of subscriptions
  })

  return {
    ...profilesResult,
    totalPubkeys: pubkeys.length,
    loadedCount: Object.keys(profilesResult.profiles).length
  }
}

/**
 * Hook for loading profiles from a single post
 * Useful for standalone post components
 */
export function usePostProfiles(post: Post) {
  return useTimelineProfiles([post], {
    autoFetch: true,
    subscribe: false, // Don't subscribe for single posts
    maxProfiles: 10
  })
} 