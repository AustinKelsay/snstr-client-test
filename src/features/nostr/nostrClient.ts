/**
 * @fileoverview Main SNSTR client configuration and wrapper
 * Handles all Nostr protocol interactions including relay connections, 
 * event publishing, subscriptions, and real-time updates
 */

// Import from SNSTR library
import { Nostr, RelayEvent, type NostrEvent, type Filter } from 'snstr'
type RelayEventType = RelayEvent
import type { PublicKey, PrivateKey, RelayUrl } from '@/types'

// Default relays for the application
const DEFAULT_RELAYS: RelayUrl[] = [
  'wss://relay.nostr.band',
  'wss://nos.lol', 
  'wss://relay.damus.io',
  'wss://nostr.wine',
  'wss://relay.snort.social'
]

// Connection configuration
const CONNECTION_CONFIG = {
  connectionTimeout: 10000, // 10 seconds
  reconnectDelay: 5000, // 5 seconds
  maxReconnectAttempts: 3,
  subscriptionTimeout: 30000, // 30 seconds
  eoseTimeout: 10000, // 10 seconds for end-of-stored-events
}

// Subscription batching configuration
const SUBSCRIPTION_CONFIG = {
  batchSize: 50, // Maximum pubkeys per subscription
  debounceDelay: 500, // Milliseconds to wait before creating subscription
  maxConcurrent: 10, // Maximum concurrent subscriptions
}

/**
 * Event handler callback types
 */
export type EventHandler = (event: NostrEvent, relayUrl: RelayUrl) => void
export type RelayEventHandler = (relayUrl: RelayUrl) => void
export type ErrorHandler = (error: Error, relayUrl?: RelayUrl) => void

/**
 * Subscription options
 */
export interface SubscriptionOptions {
  /** Automatically close subscription after EOSE */
  autoClose?: boolean
  /** Timeout for EOSE in milliseconds */
  eoseTimeout?: number
  /** Maximum number of events to receive */
  maxEvents?: number
  /** Unique identifier for the subscription */
  id?: string
}

/**
 * Query options for fetching events
 */
export interface QueryOptions {
  /** Maximum time to wait for responses in milliseconds */
  maxWait?: number
  /** Minimum number of relays that must respond */
  minResponses?: number
  /** Whether to deduplicate events by ID */
  deduplicate?: boolean
}

/**
 * Relay connection status
 */
export interface RelayStatus {
  url: RelayUrl
  connected: boolean
  connecting: boolean
  error?: string
  lastConnected?: Date
  attempts: number
}

/**
 * Main Nostr client wrapper class
 * Provides a high-level interface to the SNSTR library with additional
 * features like connection management, event caching, and error handling
 */
export class NostrClient {
  private client: InstanceType<typeof Nostr>
  private relayStatuses: Map<RelayUrl, RelayStatus> = new Map()
  private subscriptions: Map<string, string[]> = new Map()
  private eventCache: Map<string, NostrEvent> = new Map()
  private eventHandlers: Map<string, EventHandler> = new Map()
  private relayEventHandlers: Map<RelayEventType, RelayEventHandler[]> = new Map()
  private errorHandlers: ErrorHandler[] = []
  private reconnectTimers: Map<RelayUrl, NodeJS.Timeout> = new Map()
  
  constructor(relays: RelayUrl[] = DEFAULT_RELAYS) {
    this.client = new Nostr(relays)
    this.setupEventHandlers()
    this.initializeRelayStatuses(relays)
  }

  /**
   * Initialize relay status tracking
   */
  private initializeRelayStatuses(relays: RelayUrl[]): void {
    relays.forEach(relay => {
      this.relayStatuses.set(relay, {
        url: relay,
        connected: false,
        connecting: false,
        attempts: 0
      })
    })
  }

  /**
   * Set up internal event handlers for relay management
   */
  private setupEventHandlers(): void {
    // Connection events
    this.client.on(RelayEvent.Connect, (relayUrl: RelayUrl) => {
      console.log(`✅ Connected to relay: ${relayUrl}`)
      this.updateRelayStatus(relayUrl, {
        connected: true,
        connecting: false,
        error: undefined,
        lastConnected: new Date(),
        attempts: 0
      })
      this.notifyRelayEventHandlers(RelayEvent.Connect, relayUrl)
    })

    this.client.on(RelayEvent.Disconnect, (relayUrl: RelayUrl) => {
      console.log(`❌ Disconnected from relay: ${relayUrl}`)
      this.updateRelayStatus(relayUrl, {
        connected: false,
        connecting: false
      })
      this.notifyRelayEventHandlers(RelayEvent.Disconnect, relayUrl)
      this.scheduleReconnect(relayUrl)
    })

    this.client.on(RelayEvent.Error, (relayUrl: RelayUrl, error: unknown) => {
      console.error(`⚠️ Relay error ${relayUrl}:`, error)
      this.updateRelayStatus(relayUrl, {
        connected: false,
        connecting: false,
        error: error instanceof Error ? error.message : String(error)
      })
      this.notifyErrorHandlers(error instanceof Error ? error : new Error(String(error)), relayUrl)
      this.scheduleReconnect(relayUrl)
    })
  }

  /**
   * Update relay status
   */
  private updateRelayStatus(relayUrl: RelayUrl, updates: Partial<RelayStatus>): void {
    const current = this.relayStatuses.get(relayUrl)
    if (current) {
      this.relayStatuses.set(relayUrl, { ...current, ...updates })
    }
  }

  /**
   * Schedule reconnection to a relay
   */
  private scheduleReconnect(relayUrl: RelayUrl): void {
    const status = this.relayStatuses.get(relayUrl)
    if (!status || status.attempts >= CONNECTION_CONFIG.maxReconnectAttempts) {
      return
    }

    // Clear existing timer
    const existingTimer = this.reconnectTimers.get(relayUrl)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Schedule new reconnection
    const timer = setTimeout(async () => {
      const currentStatus = this.relayStatuses.get(relayUrl)
      if (currentStatus && !currentStatus.connected && !currentStatus.connecting) {
        console.log(`🔄 Attempting to reconnect to ${relayUrl} (attempt ${currentStatus.attempts + 1})`)
        this.updateRelayStatus(relayUrl, {
          connecting: true,
          attempts: currentStatus.attempts + 1
        })
        
        try {
          // SNSTR doesn't support individual relay connection
          // Reconnect to all relays instead
          await this.client.connectToRelays()
        } catch (error) {
          console.error(`Failed to reconnect to ${relayUrl}:`, error)
        }
      }
      this.reconnectTimers.delete(relayUrl)
    }, CONNECTION_CONFIG.reconnectDelay)

    this.reconnectTimers.set(relayUrl, timer)
  }



  /**
   * Notify relay event handlers
   */
  private notifyRelayEventHandlers(event: RelayEventType, relayUrl: RelayUrl): void {
    const handlers = this.relayEventHandlers.get(event) || []
    handlers.forEach(handler => {
      try {
        handler(relayUrl)
      } catch (error) {
        console.error(`Error in relay event handler for ${event}:`, error)
      }
    })
  }

  /**
   * Notify error handlers
   */
  private notifyErrorHandlers(error: Error, relayUrl?: RelayUrl): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error, relayUrl)
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    })
  }

  /**
   * Connect to all configured relays
   */
  async connectToRelays(): Promise<void> {
    console.log('🚀 Connecting to Nostr relays...')
    
    // Mark all relays as connecting
    this.relayStatuses.forEach((_status, relayUrl) => {
      this.updateRelayStatus(relayUrl, { connecting: true })
    })

    try {
      await this.client.connectToRelays()
      console.log('✅ Relay connection process initiated')
    } catch (error) {
      console.error('❌ Failed to initiate relay connections:', error)
      throw error
    }
  }

  /**
   * Note: SNSTR only supports connecting to all relays at once.
   * Individual relay connection is not supported.
   */

  /**
   * Disconnect from all relays
   */
  async disconnectFromRelays(): Promise<void> {
    console.log('🔌 Disconnecting from all relays...')
    
    // Clear reconnection timers
    this.reconnectTimers.forEach(timer => clearTimeout(timer))
    this.reconnectTimers.clear()
    
    // Clear subscriptions
    this.subscriptions.clear()
    
    try {
      this.client.disconnectFromRelays()
      console.log('✅ Disconnected from all relays')
    } catch (error) {
      console.error('❌ Error disconnecting from relays:', error)
      throw error
    }
  }

  /**
   * Add a new relay
   * Note: SNSTR requires reconnecting to all relays to add a new one
   */
  async addRelay(relayUrl: RelayUrl): Promise<void> {
    if (!this.relayStatuses.has(relayUrl)) {
      this.relayStatuses.set(relayUrl, {
        url: relayUrl,
        connected: false,
        connecting: false,
        attempts: 0
      })
      
      // Reconnect to all relays including the new one
      await this.connectToRelays()
    }
  }

  /**
   * Remove a relay
   */
  async removeRelay(relayUrl: RelayUrl): Promise<void> {
    // Clear reconnection timer
    const timer = this.reconnectTimers.get(relayUrl)
    if (timer) {
      clearTimeout(timer)
      this.reconnectTimers.delete(relayUrl)
    }
    
    // Remove from status tracking
    this.relayStatuses.delete(relayUrl)
    
    // Note: SNSTR doesn't support individual relay disconnection
    // The relay will be excluded from future connections
  }

  /**
   * Get relay connection statuses
   */
  getRelayStatuses(): RelayStatus[] {
    return Array.from(this.relayStatuses.values())
  }

  /**
   * Get connected relays
   */
  getConnectedRelays(): RelayUrl[] {
    return Array.from(this.relayStatuses.entries())
      .filter(([, status]) => status.connected)
      .map(([url]) => url)
  }

  /**
   * Subscribe to events
   */
  subscribe(
    filters: Filter[],
    onEvent: EventHandler,
    options: SubscriptionOptions = {}
  ): string {
    const subscriptionId = options.id || this.generateSubscriptionId()
    
    // Store event handler
    this.eventHandlers.set(subscriptionId, onEvent)
    
    try {
      const subIds = this.client.subscribe(
        filters,
        (event: NostrEvent, relayUrl: RelayUrl) => {
          onEvent(event, relayUrl)
        },
        undefined,
        {
          autoClose: options.autoClose || false,
          eoseTimeout: options.eoseTimeout || CONNECTION_CONFIG.eoseTimeout
        }
      )
      
      this.subscriptions.set(subscriptionId, subIds)
      console.log(`📡 Created subscription: ${subscriptionId}`)
      
      return subscriptionId
    } catch (error) {
      console.error('Failed to create subscription:', error)
      this.eventHandlers.delete(subscriptionId)
      throw error
    }
  }

  /**
   * Subscribe to profiles in batches to reduce concurrent subscriptions
   * Batches large profile requests to avoid rate limiting
   */
  subscribeToBatchedProfiles(
    pubkeys: PublicKey[],
    onEvent: EventHandler,
    options: SubscriptionOptions = {}
  ): string[] {
    if (pubkeys.length === 0) return []

    const subscriptionIds: string[] = []
    const batchSize = SUBSCRIPTION_CONFIG.batchSize

    // Split pubkeys into batches
    for (let i = 0; i < pubkeys.length; i += batchSize) {
      const batch = pubkeys.slice(i, i + batchSize)
      
      // Create batched filter
      const batchFilters: Filter[] = [{
        kinds: [0], // Profile metadata
        authors: batch
      }]

      const batchSubscriptionId = `batch_profiles_${Date.now()}_${i}`
      
      try {
        const subscriptionId = this.subscribe(
          batchFilters, 
          onEvent,
          {
            ...options,
            id: batchSubscriptionId,
            autoClose: true, // Auto-close after getting profiles
            eoseTimeout: 10000 // 10 second timeout for profiles
          }
        )
        
        subscriptionIds.push(subscriptionId)
        console.log(`📡 Created batched profile subscription: ${subscriptionId} (${batch.length} profiles)`)
      } catch (error) {
        console.error(`Failed to create batch subscription for ${batch.length} profiles:`, error)
      }
    }

    return subscriptionIds
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    const subIds = this.subscriptions.get(subscriptionId)
    if (subIds) {
      try {
        this.client.unsubscribe(subIds)
        this.subscriptions.delete(subscriptionId)
        this.eventHandlers.delete(subscriptionId)
        console.log(`🔇 Unsubscribed: ${subscriptionId}`)
      } catch (error) {
        console.error(`Failed to unsubscribe ${subscriptionId}:`, error)
      }
    }
  }

  /**
   * Fetch events from relays
   */
  async fetchEvents(
    filters: Filter[],
    options: QueryOptions = {}
  ): Promise<NostrEvent[]> {
    try {
      const events = await this.client.fetchMany(filters, {
        maxWait: options.maxWait || 5000
      })
      
      if (options.deduplicate !== false) {
        return this.deduplicateEvents(events)
      }
      
      return events
    } catch (error) {
      console.error('Failed to fetch events:', error)
      throw error
    }
  }

  /**
   * Fetch single event
   */
  async fetchEvent(
    filters: Filter[],
    options: QueryOptions = {}
  ): Promise<NostrEvent | null> {
    try {
      return await this.client.fetchOne(filters, {
        maxWait: options.maxWait || 3000
      })
    } catch (error) {
      console.error('Failed to fetch event:', error)
      throw error
    }
  }

  /**
   * Publish an event
   */
  async publishEvent(event: NostrEvent): Promise<void> {
    try {
      await this.client.publishEvent(event)
      console.log(`📤 Published event: ${event.id}`)
    } catch (error) {
      console.error('Failed to publish event:', error)
      throw error
    }
  }

  /**
   * Register relay event handler
   */
  onRelayEvent(event: RelayEventType, handler: RelayEventHandler): void {
    const handlers = this.relayEventHandlers.get(event) || []
    handlers.push(handler)
    this.relayEventHandlers.set(event, handlers)
  }

  /**
   * Register error handler
   */
  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler)
  }

  /**
   * Get cached event by ID
   */
  getCachedEvent(eventId: string): NostrEvent | undefined {
    return this.eventCache.get(eventId)
  }

  /**
   * Clear event cache
   */
  clearCache(): void {
    this.eventCache.clear()
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * Deduplicate events by ID
   */
  private deduplicateEvents(events: NostrEvent[]): NostrEvent[] {
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
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    // Clear all timers
    this.reconnectTimers.forEach(timer => clearTimeout(timer))
    this.reconnectTimers.clear()
    
    // Clear handlers
    this.eventHandlers.clear()
    this.relayEventHandlers.clear()
    this.errorHandlers.length = 0
    
    // Clear cache
    this.eventCache.clear()
    
    // Disconnect from relays
    await this.disconnectFromRelays()
  }
}

// Export singleton instance
export const nostrClient = new NostrClient()

// Export types and utilities
export { RelayEvent, type Filter, type NostrEvent }
export type { RelayUrl, PublicKey, PrivateKey } 