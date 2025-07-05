/**
 * @fileoverview Main SNSTR client configuration and wrapper
 * Handles all Nostr protocol interactions using RelayPool for efficient multi-relay management
 * Uses fetchMany for one-time queries and subscriptions only for real-time updates
 */

// Import from SNSTR library - using RelayPool for better efficiency
import { RelayPool, Nostr, RelayEvent, type NostrEvent, type Filter } from 'snstr'
type RelayEventType = RelayEvent
import type { PublicKey, PrivateKey, RelayUrl } from '@/types'
import type { RelayStatus, SubscriptionOptions, QueryOptions } from './types'

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
  batchSize: 100, // Increased from 50 for better efficiency - maximum pubkeys per subscription
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
 * Main Nostr client wrapper class
 * Uses SNSTR's RelayPool for efficient multi-relay management instead of basic Nostr client
 * Leverages fetchMany/fetchOne for one-time queries and subscriptions only for real-time updates
 */
export class NostrClient {
  private pool: RelayPool
  private client: InstanceType<typeof Nostr> // Keep for compatibility with some operations
  private relayStatuses: Map<RelayUrl, RelayStatus> = new Map()
  private subscriptions: Map<string, string[]> = new Map()
  private eventCache: Map<string, NostrEvent> = new Map()
  private eventHandlers: Map<string, EventHandler> = new Map()
  private relayEventHandlers: Map<RelayEventType, RelayEventHandler[]> = new Map()
  private errorHandlers: ErrorHandler[] = []
  private reconnectTimers: Map<RelayUrl, NodeJS.Timeout> = new Map()
  
  constructor(relays: RelayUrl[] = DEFAULT_RELAYS) {
    // Initialize RelayPool for efficient multi-relay operations
    this.pool = new RelayPool(relays)
    // Keep basic client for compatibility with some operations
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
        attempts: 0,
        messageCount: 0
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
   * Connect to all configured relays using RelayPool
   */
  async connectToRelays(): Promise<void> {
    console.log('🚀 Connecting to Nostr relays using RelayPool...')
    
    // Mark all relays as connecting
    this.relayStatuses.forEach((_status, relayUrl) => {
      this.updateRelayStatus(relayUrl, { connecting: true })
    })

    try {
      // Connect both the pool and basic client for compatibility
      await Promise.all([
        // RelayPool handles connections more efficiently
        this.connectRelayPool(),
        // Keep basic client connected for compatibility
        this.client.connectToRelays()
      ])
      console.log('✅ RelayPool and client connections initiated')
    } catch (error) {
      console.error('❌ Failed to initiate relay connections:', error)
      throw error
    }
  }

  /**
   * Connect RelayPool (internal method)
   */
  private async connectRelayPool(): Promise<void> {
    // RelayPool automatically manages connections when we use it
    // We don't need explicit connection for RelayPool - it connects on demand
    console.log('📊 RelayPool ready for on-demand connections')
  }

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
      // Disconnect both pool and basic client
      await Promise.all([
        this.pool.close(),
        Promise.resolve(this.client.disconnectFromRelays())
      ])
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
        attempts: 0,
        messageCount: 0
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
   * Subscribe to events with rate limit error handling
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
          // Cache the event for quick access
          this.eventCache.set(event.id, event)
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
      
      // Handle rate limit errors gracefully
      if (error instanceof Error && error.message.includes('rate limit')) {
        console.warn('⚠️ Rate limit exceeded - waiting before retry')
        // Don't throw rate limit errors to prevent app crashes
        return subscriptionId
      }
      
      throw error
    }
  }

  /**
   * Fetch profiles efficiently using RelayPool instead of subscriptions
   * This is much more efficient than creating subscriptions for one-time profile data
   * 
   * OLD WAY: 100 profiles = ~5-10 subscriptions = rate limiting issues
   * NEW WAY: 100 profiles = 1 cross-relay query = no rate limiting
   */
  async fetchProfilesBatch(
    pubkeys: PublicKey[],
    options: QueryOptions = {}
  ): Promise<NostrEvent[]> {
    if (pubkeys.length === 0) return []

    console.log(`🎯 Fetching ${pubkeys.length} profiles using RelayPool (no subscriptions needed)`)

    try {
      // Use RelayPool's querySync for efficient cross-relay profile fetching
      const profiles = await this.pool.querySync(
        this.getConnectedRelays(),
        {
          kinds: [0], // Profile metadata
          authors: pubkeys
        },
        {
          timeout: options.maxWait || 5000
        }
      )

      // Cache all fetched profiles
      profiles.forEach(event => {
        this.eventCache.set(event.id, event)
      })

      console.log(`✅ Fetched ${profiles.length} profiles from ${pubkeys.length} requested`)
      return profiles
    } catch (error) {
      console.error('Failed to fetch profiles batch with RelayPool:', error)
      
      // Handle rate limit errors gracefully
      if (error instanceof Error && error.message.includes('rate limit')) {
        console.warn('⚠️ Rate limit exceeded for profile fetch - returning empty array')
        return []
      }
      
      throw error
    }
  }

  /**
   * @deprecated Use fetchProfilesBatch instead - subscriptions are inefficient for one-time profile data
   * Subscribe to profiles in batches to reduce concurrent subscriptions
   * Batches large profile requests to avoid rate limiting
   */
  subscribeToBatchedProfiles(
    pubkeys: PublicKey[],
    onEvent: EventHandler,
    options: SubscriptionOptions = {}
  ): string[] {
    console.warn('⚠️ subscribeToBatchedProfiles is deprecated - use fetchProfilesBatch for better efficiency')
    
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
   * Fetch events from relays using RelayPool for efficient cross-relay querying
   */
  async fetchEvents(
    filters: Filter[],
    options: QueryOptions = {}
  ): Promise<NostrEvent[]> {
    try {
      // Use RelayPool's querySync for efficient cross-relay querying
      const events = await this.pool.querySync(
        this.getConnectedRelays(),
        filters[0], // RelayPool querySync takes a single filter object
        {
          timeout: options.maxWait || 5000
        }
      )
      
      // Cache all fetched events
      events.forEach(event => {
        this.eventCache.set(event.id, event)
      })
      
      if (options.deduplicate !== false) {
        return this.deduplicateEvents(events)
      }
      
      return events
    } catch (error) {
      console.error('Failed to fetch events with RelayPool:', error)
      
      // Handle rate limit errors gracefully
      if (error instanceof Error && error.message.includes('rate limit')) {
        console.warn('⚠️ Rate limit exceeded for fetch - returning empty array')
        return []
      }
      
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
      const event = await this.client.fetchOne(filters, {
        maxWait: options.maxWait || 3000
      })
      
      // Cache the event if found
      if (event) {
        this.eventCache.set(event.id, event)
      }
      
      return event
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
   * Clean up resources including RelayPool
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
    
    // Disconnect from relays (includes RelayPool cleanup)
    await this.disconnectFromRelays()
  }
}

// Export singleton instance
export const nostrClient = new NostrClient()

// Export types and utilities
export { RelayEvent, type Filter, type NostrEvent }
export type { RelayUrl, PublicKey, PrivateKey } 