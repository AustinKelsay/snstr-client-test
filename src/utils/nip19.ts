/**
 * @fileoverview NIP-19 utilities for bech32-encoded Nostr entities
 * Provides UI-friendly wrapper functions around SNSTR library's NIP-19 implementation
 * Includes display formatting, validation, and conversion utilities for the UI
 */

import { 
  encodePublicKey, 
  encodeNoteId,
  encodeProfile,
  encodeEvent,
  decode
} from 'snstr'

/**
 * NIP-19 entity prefixes for type checking
 */
export const NIP19_PREFIXES = {
  npub: 'npub',
  nsec: 'nsec', 
  note: 'note',
  nprofile: 'nprofile',
  nevent: 'nevent',
  naddr: 'naddr',
  nrelay: 'nrelay',
} as const

export type Nip19Prefix = keyof typeof NIP19_PREFIXES

/**
 * UI-friendly NIP-19 entity types
 */
export interface DisplayEntity {
  type: Nip19Prefix
  encoded: string
  displayText: string
  copyText: string
  isValid: boolean
}

/**
 * Options for formatting NIP-19 entities for display
 */
export interface DisplayOptions {
  /** Number of characters to show at start */
  startChars?: number
  /** Number of characters to show at end */
  endChars?: number
  /** Whether to show the prefix */
  showPrefix?: boolean
  /** Custom separator for truncation */
  separator?: string
}

/**
 * Checks if a string is a valid NIP-19 entity
 */
export function isNip19Entity(entity: string): boolean {
  if (!entity || typeof entity !== 'string') return false
  
  // Check if it starts with a known prefix
  const hasValidPrefix = Object.values(NIP19_PREFIXES).some(prefix => 
    entity.startsWith(prefix + '1')
  )
  
  if (!hasValidPrefix) return false
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    decode(entity as any)
    return true
  } catch {
    return false
  }
}

/**
 * Gets the entity type from a NIP-19 string
 */
export function getEntityType(entity: string): Nip19Prefix | null {
  if (!entity || typeof entity !== 'string') return null
  
  for (const [key, prefix] of Object.entries(NIP19_PREFIXES)) {
    if (entity.startsWith(prefix + '1')) {
      return key as Nip19Prefix
    }
  }
  
  return null
}

/**
 * Formats a NIP-19 entity for display with truncation
 */
export function formatNip19ForDisplay(
  entity: string, 
  options: DisplayOptions = {}
): string {
  const {
    startChars = 8,
    endChars = 4,
    showPrefix = true,
    separator = '...'
  } = options

  if (!entity || entity.length <= startChars + endChars) {
    return entity
  }

  const entityType = getEntityType(entity)
  if (!entityType) return entity

  const prefix = showPrefix ? entityType : ''
  const colonPrefix = showPrefix ? ':' : ''
  
  // Find the '1' separator in bech32 format
  const separatorIndex = entity.indexOf('1')
  if (separatorIndex === -1) return entity
  
  const data = entity.slice(separatorIndex + 1)
  if (data.length <= startChars + endChars) {
    return prefix + colonPrefix + data
  }
  
  const truncated = data.slice(0, startChars) + separator + data.slice(-endChars)
  return prefix + colonPrefix + truncated
}

/**
 * Converts hex pubkey to npub format safely
 */
export function pubkeyToNpub(pubkey: string): string {
  if (!pubkey) return pubkey
  
  // Already encoded
  if (isNip19Entity(pubkey)) {
    const type = getEntityType(pubkey)
    if (type === 'npub' || type === 'nprofile') {
      return pubkey
    }
  }
  
  // Try to encode as npub
  try {
    if (isValidHexString(pubkey, 64)) {
      return encodePublicKey(pubkey)
    }
  } catch {
    // Fall back to original
  }
  
  return pubkey
}

/**
 * Converts hex event ID to note format safely
 */
export function eventIdToNote(eventId: string): string {
  if (!eventId) return eventId
  
  // Already encoded
  if (isNip19Entity(eventId)) {
    const type = getEntityType(eventId)
    if (type === 'note' || type === 'nevent') {
      return eventId
    }
  }
  
  // Try to encode as note
  try {
    if (isValidHexString(eventId, 64)) {
      return encodeNoteId(eventId)
    }
  } catch {
    // Fall back to original
  }
  
  return eventId
}

/**
 * Converts NIP-19 entity to hex format for internal use
 */
export function nip19ToHex(entity: string): string {
  if (!entity || !isNip19Entity(entity)) return entity
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded = decode(entity as any)
    
    switch (decoded.type) {
      case 'npub':
      case 'nsec':
      case 'note':
        return decoded.data
      case 'nprofile':
        return decoded.data.pubkey
      case 'nevent':
        return decoded.data.id
      case 'naddr':
        // For naddr, return the pubkey (most common use case)
        return decoded.data.pubkey
      default:
        return entity
    }
  } catch {
    return entity
  }
}

/**
 * Creates a display-friendly entity object
 */
export function createDisplayEntity(
  entity: string, 
  options: DisplayOptions = {}
): DisplayEntity {
  const type = getEntityType(entity) || 'npub'
  const isValid = isNip19Entity(entity)
  
  return {
    type,
    encoded: entity,
    displayText: formatNip19ForDisplay(entity, options),
    copyText: entity,
    isValid
  }
}

/**
 * Safely encodes a profile with relays
 */
export function safeEncodeProfile(pubkey: string, relays?: string[]): string {
  try {
    if (!isValidHexString(pubkey, 64)) {
      throw new Error('Invalid pubkey format')
    }
    
    // Filter valid relay URLs
    const validRelays = relays?.filter(isValidRelayUrl) || []
    
    if (validRelays.length === 0) {
      // Use simple npub if no valid relays
      return encodePublicKey(pubkey)
    }
    
    return encodeProfile({ pubkey, relays: validRelays })
  } catch {
    return pubkey
  }
}

/**
 * Safely encodes an event with metadata
 */
export function safeEncodeEvent(
  eventId: string, 
  relays?: string[], 
  author?: string, 
  kind?: number
): string {
  try {
    if (!isValidHexString(eventId, 64)) {
      throw new Error('Invalid event ID format')
    }
    
    // Filter valid relay URLs
    const validRelays = relays?.filter(isValidRelayUrl) || []
    
    // Validate author if provided
    const validAuthor = author && isValidHexString(author, 64) ? author : undefined
    
    // Validate kind if provided
    const validKind = typeof kind === 'number' && kind >= 0 ? kind : undefined
    
    if (validRelays.length === 0 && !validAuthor && !validKind) {
      // Use simple note if no metadata
      return encodeNoteId(eventId)
    }
    
    return encodeEvent({
      id: eventId,
      relays: validRelays.length > 0 ? validRelays : undefined,
      author: validAuthor,
      kind: validKind
    })
  } catch {
    return eventId
  }
}

/**
 * Simple relay URL validation
 */
function isValidRelayUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'ws:' || parsed.protocol === 'wss:'
  } catch {
    return false
  }
}

/**
 * Safely decodes any NIP-19 entity
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeDecodeEntity(entity: string): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return decode(entity as any)
  } catch (error) {
    console.warn('Failed to decode NIP-19 entity:', entity, error)
    return null
  }
}

/**
 * Validates a hex string format
 */
export function isValidHexString(hex: string, expectedLength?: number): boolean {
  if (!hex || typeof hex !== 'string') return false
  
  const cleanHex = hex.replace(/^0x/, '')
  if (!/^[0-9a-f]+$/i.test(cleanHex)) return false
  
  if (expectedLength && cleanHex.length !== expectedLength) return false
  
  return true
}

/**
 * Extracts pubkey from any NIP-19 entity that contains one
 */
export function extractPubkey(entity: string): string | null {
  if (!entity) return null
  
  // If it's already a hex pubkey
  if (isValidHexString(entity, 64)) {
    return entity
  }
  
  // If it's a NIP-19 entity
  if (isNip19Entity(entity)) {
    const decoded = safeDecodeEntity(entity)
    if (!decoded) return null
    
    switch (decoded.type) {
      case 'npub':
        return decoded.data
      case 'nprofile':
        return decoded.data.pubkey
      case 'nevent':
        return decoded.data.author || null
      case 'naddr':
        return decoded.data.pubkey
      default:
        return null
    }
  }
  
  return null
}

/**
 * Extracts event ID from any NIP-19 entity that contains one
 */
export function extractEventId(entity: string): string | null {
  if (!entity) return null
  
  // If it's already a hex event ID
  if (isValidHexString(entity, 64)) {
    return entity
  }
  
  // If it's a NIP-19 entity
  if (isNip19Entity(entity)) {
    const decoded = safeDecodeEntity(entity)
    if (!decoded) return null
    
    switch (decoded.type) {
      case 'note':
        return decoded.data
      case 'nevent':
        return decoded.data.id
      default:
        return null
    }
  }
  
  return null
}

/**
 * Extracts relay URLs from any NIP-19 entity that contains them
 */
export function extractRelays(entity: string): string[] {
  if (!entity || !isNip19Entity(entity)) return []
  
  const decoded = safeDecodeEntity(entity)
  if (!decoded) return []
  
  switch (decoded.type) {
    case 'nprofile':
      return decoded.data.relays || []
    case 'nevent':
      return decoded.data.relays || []
    case 'naddr':
      return decoded.data.relays || []
    default:
      return []
  }
}

/**
 * Checks if an entity is a user-shareable identifier (excludes nsec for security)
 */
export function isShareableEntity(entity: string): boolean {
  if (!isNip19Entity(entity)) return false
  
  const type = getEntityType(entity)
  return type !== 'nsec' // Never share private keys
}

/**
 * Gets user-friendly description of entity type
 */
export function getEntityDescription(entity: string): string {
  const type = getEntityType(entity)
  
  switch (type) {
    case 'npub':
      return 'Public Key'
    case 'nsec':
      return 'Private Key'
    case 'note':
      return 'Note'
    case 'nprofile':
      return 'Profile'
    case 'nevent':
      return 'Event'
    case 'naddr':
      return 'Address'
    case 'nrelay':
      return 'Relay'
    default:
      return 'Unknown'
  }
}

/**
 * Formats entity for copy-to-clipboard with optional prefix
 */
export function formatForClipboard(entity: string, includePrefix = false): string {
  if (!isNip19Entity(entity)) return entity
  
  const description = getEntityDescription(entity)
  
  if (includePrefix) {
    return `${description}: ${entity}`
  }
  
  return entity
} 