/**
 * @fileoverview Navigation utility functions
 * Provides reusable navigation helpers for consistent routing across the app
 */

import type { PublicKey } from '@/types'

/**
 * Creates a profile navigation handler function
 * 
 * @param navigate - React Router navigate function
 * @param currentUserPubkey - Current user's public key (optional)
 * @returns Navigation handler function
 */
export function createProfileNavigator(
  navigate: (path: string) => void,
  currentUserPubkey?: PublicKey | null
) {
  return (pubkey: PublicKey) => {
    if (pubkey === currentUserPubkey) {
      navigate('/profile')
    } else {
      navigate(`/profile/${pubkey}`)
    }
  }
}

/**
 * Gets the profile path for a given pubkey
 * 
 * @param pubkey - User's public key
 * @param currentUserPubkey - Current user's public key (optional)
 * @returns Profile path
 */
export function getProfilePath(pubkey: PublicKey, currentUserPubkey?: PublicKey | null): string {
  if (pubkey === currentUserPubkey) {
    return '/profile'
  }
  return `/profile/${pubkey}`
}

/**
 * Gets the post path for a given post ID
 * 
 * @param postId - Post ID
 * @returns Post path
 */
export function getPostPath(postId: string): string {
  return `/post/${postId}`
}

/**
 * Gets the hashtag search path
 * 
 * @param hashtag - Hashtag without the # prefix
 * @returns Search path for the hashtag
 */
export function getHashtagPath(hashtag: string): string {
  return `/search?q=${encodeURIComponent(`#${hashtag}`)}`
} 