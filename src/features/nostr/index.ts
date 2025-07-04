/**
 * @fileoverview Nostr feature public API exports
 * Provides clean interface for all Nostr protocol functionality including
 * client management, event handling, relay management, and utilities
 */

// Main client and types (when snstr is available, we'll uncomment these)
// export { NostrClient, nostrClient, RelayEvent } from './nostrClient'

// Event handling and processing
export {
  EventKind,
  validateEvent,
  processEvent,
  extractEventReferences,
  parseEventContent,
  filterEvents,
  sortEvents,
  deduplicateEvents,
  buildEventFilter,
  getEventAge,
  isReply,
  isRootPost,
  getParentEventId,
  getMentionedPubkeys,
  mentionsPubkey,
  EventProcessor,
  eventProcessor
} from './eventHandlers'

export type {
  EventValidationResult,
  ProcessedEvent,
  EventReference,
  ProcessingOptions,
  EventFilterOptions
} from './eventHandlers'

// Relay management
export {
  RelayManager,
  relayManager,
  DEFAULT_RELAYS
} from './relayManager'

export type {
  RelayStatus,
  RelayConfig,
  RelayHealth,
  RelayManagerConfig
} from './relayManager'

// Subscription management
export {
  SubscriptionManager,
  subscriptionManager
} from './subscriptionManager'

export type {
  SubscriptionOptions,
  SubscriptionStatus,
  EventCallback,
  EoseCallback,
  SubscriptionErrorCallback
} from './subscriptionManager'

// Re-export types from main types module
export type {
  NostrEvent,
  Filter,
  PublicKey,
  PrivateKey,
  RelayUrl,
  Timestamp
} from '@/types' 