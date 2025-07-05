/**
 * @fileoverview Navigation utility functions
 * Provides reusable navigation helpers for consistent routing across the app
 * Supports both hex and NIP-19 encoded identifiers
 */

import type { PublicKey } from '@/types'
import { 
  pubkeyToNpub, 
  eventIdToNote,
  isNip19Entity,
  extractPubkey,
  extractEventId,
  nip19ToHex
} from './nip19'
import { normalizePublicKey, normalizeEventId } from './nostr'

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

/**
 * Creates a profile navigation handler function that supports NIP-19 identifiers
 * 
 * @param navigate - React Router navigate function
 * @param currentUserPubkey - Current user's public key (optional)
 * @returns Navigation handler function that accepts hex or NIP-19 pubkeys
 */
export function createNip19ProfileNavigator(
  navigate: (path: string) => void,
  currentUserPubkey?: PublicKey | null
) {
  return (pubkeyOrNpub: string) => {
    const normalizedPubkey = normalizePublicKey(pubkeyOrNpub)
    const normalizedCurrentPubkey = currentUserPubkey ? normalizePublicKey(currentUserPubkey) : null
    
    if (normalizedPubkey === normalizedCurrentPubkey) {
      navigate('/profile')
    } else {
      // Use NIP-19 format in URL for user-friendly display
      const npub = pubkeyToNpub(normalizedPubkey)
      navigate(`/profile/${npub}`)
    }
  }
}

/**
 * Gets the profile path for a given pubkey (supports NIP-19)
 * 
 * @param pubkeyOrNpub - User's public key (hex or NIP-19)
 * @param currentUserPubkey - Current user's public key (optional)
 * @returns Profile path using NIP-19 format
 */
export function getNip19ProfilePath(pubkeyOrNpub: string, currentUserPubkey?: PublicKey | null): string {
  const normalizedPubkey = normalizePublicKey(pubkeyOrNpub)
  const normalizedCurrentPubkey = currentUserPubkey ? normalizePublicKey(currentUserPubkey) : null
  
  if (normalizedPubkey === normalizedCurrentPubkey) {
    return '/profile'
  }
  
  const npub = pubkeyToNpub(normalizedPubkey)
  return `/profile/${npub}`
}

/**
 * Gets the post path for a given post ID (supports NIP-19)
 * 
 * @param postIdOrNote - Post ID (hex or NIP-19)
 * @returns Post path using NIP-19 format
 */
export function getNip19PostPath(postIdOrNote: string): string {
  const normalizedPostId = normalizeEventId(postIdOrNote)
  const noteId = eventIdToNote(normalizedPostId)
  return `/post/${noteId}`
}

/**
 * Parses a route parameter that could be hex or NIP-19 format
 * 
 * @param param - Route parameter value
 * @returns Object with both hex and display formats
 */
export function parseRouteIdentifier(param: string): {
  hex: string
  display: string
  isNip19: boolean
  type: 'pubkey' | 'event' | 'unknown'
} {
  if (isNip19Entity(param)) {
    const pubkey = extractPubkey(param)
    const eventId = extractEventId(param)
    
    if (pubkey) {
      return {
        hex: pubkey,
        display: param,
        isNip19: true,
        type: 'pubkey'
      }
    }
    
    if (eventId) {
      return {
        hex: eventId,
        display: param,
        isNip19: true,
        type: 'event'
      }
    }
  }
  
  // Assume hex format
  const hex = nip19ToHex(param)
  return {
    hex,
    display: param,
    isNip19: false,
    type: hex.length === 64 ? 'pubkey' : 'unknown'
  }
}

/**
 * Creates a consistent URL-friendly identifier from any input
 * Prefers NIP-19 format for user-friendly URLs
 * 
 * @param identifier - Hex or NIP-19 identifier
 * @param type - Type of identifier to generate
 * @returns URL-friendly identifier
 */
export function createUrlIdentifier(identifier: string, type: 'pubkey' | 'event'): string {
  if (type === 'pubkey') {
    const hex = normalizePublicKey(identifier)
    return pubkeyToNpub(hex)
  } else {
    const hex = normalizeEventId(identifier)
    return eventIdToNote(hex)
  }
}

/**
 * Validates that a route parameter represents a valid Nostr identifier
 * 
 * @param param - Route parameter to validate
 * @returns True if valid pubkey or event ID
 */
export function isValidRouteIdentifier(param: string): boolean {
  if (!param) return false
  
  // Check if it's a valid NIP-19 entity
  if (isNip19Entity(param)) {
    return extractPubkey(param) !== null || extractEventId(param) !== null
  }
  
  // Check if it's a valid hex string
  return param.length === 64 && /^[0-9a-f]+$/i.test(param)
} 