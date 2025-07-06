/**
 * @fileoverview Event handling utilities for Nostr events
 * Provides event processing, validation, filtering, and transformation utilities
 * with support for different event kinds and proper error handling
 */

import type { NostrEvent, Filter, PublicKey, RelayUrl } from '@/types'

/**
 * Standard Nostr event kinds
 */
export const EventKind = {
  Metadata: 0,           // User metadata (profiles)
  TextNote: 1,           // Text notes (posts)
  RecommendRelay: 2,     // Recommend relay
  Contacts: 3,           // Contact list
  EncryptedDM: 4,        // Encrypted direct messages (deprecated)
  EventDeletion: 5,      // Event deletion
  Repost: 6,            // Reposts
  Reaction: 7,          // Reactions (likes)
  ChannelCreation: 40,   // Channel creation
  ChannelMetadata: 41,   // Channel metadata
  ChannelMessage: 42,    // Channel message
  ChannelHideMessage: 43, // Channel hide message
  ChannelMuteUser: 44,   // Channel mute user
  Zap: 9735,            // Lightning zaps
  // Replaceable events (10000-19999)
  // Ephemeral events (20000-29999) 
  // Addressable events (30000-39999)
} as const

/**
 * Event validation result
 */
export interface EventValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Processed event with additional metadata
 */
export interface ProcessedEvent extends NostrEvent {
  /** Relay where the event was received */
  relay?: RelayUrl
  /** When the event was processed */
  processedAt: Date
  /** Whether the event passed validation */
  isValid: boolean
  /** Validation errors if any */
  validationErrors?: string[]
  /** Parsed content for specific event types */
  parsedContent?: unknown
  /** References to other events (replies, mentions, etc.) */
  references?: EventReference[]
}

/**
 * Event reference (e, p, a tags)
 */
export interface EventReference {
  type: 'event' | 'pubkey' | 'address'
  id: string
  relay?: RelayUrl
  marker?: 'reply' | 'root' | 'mention'
}

/**
 * Event processing options
 */
export interface ProcessingOptions {
  /** Whether to validate the event */
  validate?: boolean
  /** Whether to parse content based on event kind */
  parseContent?: boolean
  /** Whether to extract references */
  extractReferences?: boolean
  /** Custom validation rules */
  customValidation?: (event: NostrEvent) => EventValidationResult
}

/**
 * Event filter options for querying
 */
export interface EventFilterOptions {
  /** Event kinds to include */
  kinds?: number[]
  /** Authors to include */
  authors?: PublicKey[]
  /** Since timestamp */
  since?: number
  /** Until timestamp */
  until?: number
  /** Limit number of events */
  limit?: number
  /** Search string (if supported by relay) */
  search?: string
  /** Tag filters */
  tags?: Record<string, string[]>
}

/**
 * Validates a Nostr event according to NIP-01 specification
 */
export function validateEvent(event: NostrEvent): EventValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!event.id) {
    errors.push('Event ID is required')
  } else if (!/^[0-9a-f]{64}$/i.test(event.id)) {
    errors.push('Invalid event ID format')
  }

  if (!event.pubkey) {
    errors.push('Public key is required')
  } else if (!/^[0-9a-f]{64}$/i.test(event.pubkey)) {
    errors.push('Invalid public key format')
  }

  if (!event.sig) {
    errors.push('Signature is required')
  } else if (!/^[0-9a-f]{128}$/i.test(event.sig)) {
    errors.push('Invalid signature format')
  }

  if (typeof event.kind !== 'number') {
    errors.push('Event kind must be a number')
  } else if (event.kind < 0) {
    errors.push('Event kind must be non-negative')
  }

  if (typeof event.created_at !== 'number') {
    errors.push('Created timestamp must be a number')
  } else if (event.created_at < 0) {
    errors.push('Created timestamp must be positive')
  }

  if (typeof event.content !== 'string') {
    errors.push('Event content must be a string')
  }

  if (!Array.isArray(event.tags)) {
    errors.push('Event tags must be an array')
  } else {
    // Validate tag structure
    event.tags.forEach((tag, index) => {
      if (!Array.isArray(tag)) {
        errors.push(`Tag at index ${index} must be an array`)
      } else if (tag.length === 0) {
        warnings.push(`Tag at index ${index} is empty`)
      } else if (typeof tag[0] !== 'string') {
        errors.push(`Tag at index ${index} must start with a string`)
      }
    })
  }

  // Content length validation
  if (event.content && event.content.length > 100000) {
    warnings.push('Event content is very long (>100KB)')
  }

  // Future timestamp warning
  const now = Math.floor(Date.now() / 1000)
  if (event.created_at > now + 60) {
    warnings.push('Event timestamp is in the future')
  }

  // Very old timestamp warning
  if (event.created_at < now - (365 * 24 * 60 * 60)) {
    warnings.push('Event timestamp is very old (>1 year)')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Process a raw Nostr event with additional metadata and validation
 */
export function processEvent(
  event: NostrEvent, 
  relay?: RelayUrl,
  options: ProcessingOptions = {}
): ProcessedEvent {
  const processedAt = new Date()
  
  // Validate event if requested
  let validationResult: EventValidationResult | undefined
  if (options.validate !== false) {
    validationResult = options.customValidation 
      ? options.customValidation(event)
      : validateEvent(event)
  }

  // Extract references if requested
  let references: EventReference[] | undefined
  if (options.extractReferences) {
    references = extractEventReferences(event)
  }

  // Parse content if requested
  let parsedContent: unknown
  if (options.parseContent) {
    parsedContent = parseEventContent(event)
  }

  const processed: ProcessedEvent = {
    ...event,
    relay,
    processedAt,
    isValid: validationResult?.isValid ?? true,
    validationErrors: validationResult?.errors,
    references,
    parsedContent
  }

  return processed
}

/**
 * Extract event references from tags (e, p, a tags)
 */
export function extractEventReferences(event: NostrEvent): EventReference[] {
  const references: EventReference[] = []

  event.tags.forEach(tag => {
    if (tag.length < 2) return

    const [type, id, relay, marker] = tag

    switch (type) {
      case 'e': // Event reference
        references.push({
          type: 'event',
          id,
          relay: relay as RelayUrl,
          marker: marker as 'reply' | 'root' | 'mention' | undefined
        })
        break
      
      case 'p': // Pubkey reference
        references.push({
          type: 'pubkey',
          id,
          relay: relay as RelayUrl,
          marker: marker as 'reply' | 'root' | 'mention' | undefined
        })
        break
      
      case 'a': // Addressable event reference
        references.push({
          type: 'address',
          id,
          relay: relay as RelayUrl,
          marker: marker as 'reply' | 'root' | 'mention' | undefined
        })
        break
    }
  })

  return references
}

/**
 * Parse event content based on event kind
 */
export function parseEventContent(event: NostrEvent): unknown {
  try {
    switch (event.kind) {
      case EventKind.Metadata:
        // User metadata is JSON
        return JSON.parse(event.content)
      
      case EventKind.TextNote:
        // Text notes are plain text
        return event.content
      
      case EventKind.Contacts:
        // Contact list content might be JSON with relay info
        return event.content ? JSON.parse(event.content) : {}
      
      case EventKind.EncryptedDM:
        // Encrypted DMs need decryption (not implemented here)
        return event.content
      
      default:
        // For unknown kinds, try JSON parse, fallback to plain text
        try {
          return JSON.parse(event.content)
        } catch {
          return event.content
        }
    }
  } catch (error) {
    console.warn(`Failed to parse content for event ${event.id}:`, error)
    return event.content
  }
}

/**
 * Filter events by criteria
 */
export function filterEvents(
  events: NostrEvent[], 
  criteria: EventFilterOptions
): NostrEvent[] {
  return events.filter(event => {
    // Filter by kinds
    if (criteria.kinds && !criteria.kinds.includes(event.kind)) {
      return false
    }

    // Filter by authors
    if (criteria.authors && !criteria.authors.includes(event.pubkey)) {
      return false
    }

    // Filter by time range
    if (criteria.since && event.created_at < criteria.since) {
      return false
    }

    if (criteria.until && event.created_at > criteria.until) {
      return false
    }

    // Filter by search (simple content search)
    if (criteria.search) {
      const searchLower = criteria.search.toLowerCase()
      if (!event.content.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Filter by tags
    if (criteria.tags) {
      for (const [tagName, tagValues] of Object.entries(criteria.tags)) {
        const hasTag = event.tags.some(tag => 
          tag[0] === tagName && tagValues.includes(tag[1])
        )
        if (!hasTag) {
          return false
        }
      }
    }

    return true
  })
}

/**
 * Sort events by timestamp (newest first by default)
 */
export function sortEvents(events: NostrEvent[], ascending = false): NostrEvent[] {
  return [...events].sort((a, b) => {
    return ascending 
      ? a.created_at - b.created_at
      : b.created_at - a.created_at
  })
}

/**
 * Deduplicate events by ID
 */
export function deduplicateEvents(events: NostrEvent[]): NostrEvent[] {
  const seen = new Set<string>()
  return events.filter(event => {
    if (seen.has(event.id)) {
      return false
    }
    seen.add(event.id)
    return true
  })
}

/**
 * Build a filter object for querying events
 */
export function buildEventFilter(options: EventFilterOptions): Filter {
  const filter: Filter = {}

  if (options.kinds) {
    filter.kinds = options.kinds
  }

  if (options.authors) {
    filter.authors = options.authors
  }

  if (options.since) {
    filter.since = options.since
  }

  if (options.until) {
    filter.until = options.until
  }

  if (options.limit) {
    filter.limit = options.limit
  }

  if (options.search) {
    filter.search = options.search
  }

  // Add tag filters
  if (options.tags) {
    Object.entries(options.tags).forEach(([tagName, values]) => {
      filter[`#${tagName}`] = values
    })
  }

  return filter
}

/**
 * Get event age in human readable format
 */
export function getEventAge(event: NostrEvent): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - event.created_at

  if (diff < 60) {
    return `${diff}s`
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}m`
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h`
  } else if (diff < 2592000) {
    return `${Math.floor(diff / 86400)}d`
  } else {
    return `${Math.floor(diff / 2592000)}mo`
  }
}

/**
 * Check if event is a reply
 */
export function isReply(event: NostrEvent): boolean {
  return event.tags.some(tag => tag[0] === 'e')
}

/**
 * Check if event is a root post
 */
export function isRootPost(event: NostrEvent): boolean {
  return !isReply(event)
}

/**
 * Get the parent event ID if this is a reply
 */
export function getParentEventId(event: NostrEvent): string | null {
  const eTags = event.tags.filter(tag => tag[0] === 'e')
  
  if (eTags.length === 0) {
    return null
  }

  // Look for 'reply' marker first
  const replyTag = eTags.find(tag => tag[3] === 'reply')
  if (replyTag) {
    return replyTag[1]
  }

  // Fallback to last e tag (NIP-10 convention)
  return eTags[eTags.length - 1][1]
}

/**
 * Get mentioned pubkeys from the event
 */
export function getMentionedPubkeys(event: NostrEvent): PublicKey[] {
  return event.tags
    .filter(tag => tag[0] === 'p')
    .map(tag => tag[1])
    .filter(pubkey => /^[0-9a-f]{64}$/i.test(pubkey))
}

/**
 * Check if event mentions a specific pubkey
 */
export function mentionsPubkey(event: NostrEvent, pubkey: PublicKey): boolean {
  return getMentionedPubkeys(event).includes(pubkey)
}

/**
 * Event handler for different event kinds
 */
export class EventProcessor {
  private handlers: Map<number, ((event: ProcessedEvent) => void)[]> = new Map()

  /**
   * Register handler for specific event kind
   */
  onEventKind(kind: number, handler: (event: ProcessedEvent) => void): void {
    const handlers = this.handlers.get(kind) || []
    handlers.push(handler)
    this.handlers.set(kind, handlers)
  }

  /**
   * Process an event through registered handlers
   */
  processEvent(event: ProcessedEvent): void {
    const handlers = this.handlers.get(event.kind) || []
    handlers.forEach(handler => {
      try {
        handler(event)
      } catch (error) {
        console.error(`Error in event handler for kind ${event.kind}:`, error)
      }
    })
  }

  /**
   * Clear all handlers
   */
  clearHandlers(): void {
    this.handlers.clear()
  }
}

// Export a default event processor instance
export const eventProcessor = new EventProcessor() 