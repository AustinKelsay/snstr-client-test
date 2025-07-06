/**
 * @fileoverview Real-time subscription management for Nostr events
 * Handles live event streaming, subscription lifecycle, and automatic cleanup
 * Provides a high-level interface for managing real-time updates
 */

import type { NostrEvent, Filter, RelayUrl } from '@/types'
import { relayManager } from './relayManager'

/**
 * Subscription configuration options
 */
export interface SubscriptionOptions {
  /** Unique identifier for the subscription */
  id?: string
  /** Automatically close subscription after EOSE (End of Stored Events) */
  autoClose?: boolean
  /** Timeout for EOSE in milliseconds */
  eoseTimeout?: number
  /** Maximum number of events to receive before auto-closing */
  maxEvents?: number
  /** Whether to enable real-time updates */
  realTime?: boolean
  /** Specific relays to subscribe to (defaults to all connected) */
  relays?: RelayUrl[]
  /** Event deduplication strategy */
  deduplicate?: boolean
}

/**
 * Subscription status
 */
export interface SubscriptionStatus {
  id: string
  active: boolean
  created: Date
  lastEvent?: Date
  eventCount: number
  relayCount: number
  error?: string
}

/**
 * Event callback function type
 */
export type EventCallback = (event: NostrEvent, relay: RelayUrl) => void

/**
 * EOSE (End of Stored Events) callback type
 */
export type EoseCallback = (subscriptionId: string) => void

/**
 * Subscription error callback type
 */
export type SubscriptionErrorCallback = (subscriptionId: string, error: Error) => void

/**
 * Real-time subscription manager
 * Handles multiple subscriptions, automatic cleanup, and event distribution
 */
export class SubscriptionManager {
  private subscriptions: Map<string, {
    options: SubscriptionOptions
    filters: Filter[]
    onEvent: EventCallback
    onEose?: EoseCallback
    onError?: SubscriptionErrorCallback
    status: SubscriptionStatus
    timers: Set<NodeJS.Timeout>
  }> = new Map()

  private eventListeners: Map<string, Set<EventCallback>> = new Map()
  private globalEventCount = 0
  private isActive = false

  /**
   * Initialize the subscription manager
   */
  async initialize(): Promise<void> {
    if (this.isActive) {
      return
    }

    console.log('🔔 Initializing subscription manager...')
    this.isActive = true

    // Set up relay event listeners
    relayManager.on('statusChange', (relay, status) => {
      if (status && typeof status === 'object' && 'connected' in status) {
        if (status.connected) {
          this.handleRelayConnected(relay)
        } else {
          this.handleRelayDisconnected(relay)
        }
      }
    })

    console.log('✅ Subscription manager initialized')
  }

  /**
   * Create a new subscription
   */
  subscribe(
    filters: Filter[],
    onEvent: EventCallback,
    onEose?: EoseCallback,
    onError?: SubscriptionErrorCallback,
    options: SubscriptionOptions = {}
  ): string {
    const subscriptionId = options.id || this.generateSubscriptionId()

    // Validate filters
    if (!filters || filters.length === 0) {
      throw new Error('At least one filter is required for subscription')
    }

    // Create subscription status
    const status: SubscriptionStatus = {
      id: subscriptionId,
      active: true,
      created: new Date(),
      eventCount: 0,
      relayCount: 0
    }

    // Set up timers for auto-close
    const timers = new Set<NodeJS.Timeout>()

    // EOSE timeout timer
    if (options.eoseTimeout && options.eoseTimeout > 0) {
      const eoseTimer = setTimeout(() => {
        console.log(`⏰ EOSE timeout for subscription ${subscriptionId}`)
        if (onEose) {
          onEose(subscriptionId)
        }
        if (options.autoClose) {
          this.unsubscribe(subscriptionId)
        }
      }, options.eoseTimeout)
      timers.add(eoseTimer)
    }

    // Store subscription
    this.subscriptions.set(subscriptionId, {
      options,
      filters,
      onEvent,
      onEose,
      onError,
      status,
      timers
    })

    console.log(`📡 Created subscription: ${subscriptionId}`)

    // TODO: When snstr is available, create actual relay subscriptions
    // For now, just simulate subscription creation
    this.simulateSubscription(subscriptionId)

    return subscriptionId
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId)
    
    if (!subscription) {
      console.warn(`⚠️ Subscription ${subscriptionId} not found`)
      return false
    }

    // Clear timers
    subscription.timers.forEach(timer => clearTimeout(timer))
    subscription.timers.clear()

    // Mark as inactive
    subscription.status.active = false

    // Remove from subscriptions
    this.subscriptions.delete(subscriptionId)

    // TODO: When snstr is available, unsubscribe from relays
    console.log(`🔇 Unsubscribed: ${subscriptionId}`)

    return true
  }

  /**
   * Unsubscribe from all active subscriptions
   */
  unsubscribeAll(): void {
    console.log('🔇 Unsubscribing from all subscriptions...')
    
    const subscriptionIds = Array.from(this.subscriptions.keys())
    subscriptionIds.forEach(id => this.unsubscribe(id))
    
    console.log(`✅ Unsubscribed from ${subscriptionIds.length} subscriptions`)
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus(subscriptionId: string): SubscriptionStatus | undefined {
    const subscription = this.subscriptions.get(subscriptionId)
    return subscription?.status
  }

  /**
   * Get all active subscriptions
   */
  getActiveSubscriptions(): SubscriptionStatus[] {
    return Array.from(this.subscriptions.values())
      .map(sub => sub.status)
      .filter(status => status.active)
  }

  /**
   * Get subscription statistics
   */
  getStats(): {
    totalSubscriptions: number
    activeSubscriptions: number
    totalEvents: number
    averageEventsPerSubscription: number
  } {
    const active = this.getActiveSubscriptions()
    const totalEvents = active.reduce((sum, sub) => sum + sub.eventCount, 0)
    
    return {
      totalSubscriptions: this.subscriptions.size,
      activeSubscriptions: active.length,
      totalEvents: this.globalEventCount,
      averageEventsPerSubscription: active.length > 0 ? totalEvents / active.length : 0
    }
  }

  /**
   * Handle incoming event (called by relay manager or mock system)
   */
  handleEvent(event: NostrEvent, relay: RelayUrl): void {
    this.globalEventCount++

    // Distribute event to matching subscriptions
    this.subscriptions.forEach((subscription, subscriptionId) => {
      if (!subscription.status.active) {
        return
      }

      // Check if event matches any of the subscription filters
      if (this.eventMatchesFilters(event, subscription.filters)) {
        // Update subscription statistics
        subscription.status.eventCount++
        subscription.status.lastEvent = new Date()

        // Check max events limit
        if (subscription.options.maxEvents && 
            subscription.status.eventCount >= subscription.options.maxEvents) {
          console.log(`📊 Max events reached for subscription ${subscriptionId}`)
          if (subscription.options.autoClose) {
            this.unsubscribe(subscriptionId)
            return
          }
        }

        // Call event handler
        try {
          subscription.onEvent(event, relay)
        } catch (error) {
          console.error(`Error in event handler for ${subscriptionId}:`, error)
          if (subscription.onError) {
            subscription.onError(subscriptionId, error as Error)
          }
        }
      }
    })
  }

  /**
   * Handle relay connection
   */
  private handleRelayConnected(relay: RelayUrl): void {
    console.log(`🔌 Relay connected: ${relay}`)
    // TODO: Reestablish subscriptions on this relay
  }

  /**
   * Handle relay disconnection
   */
  private handleRelayDisconnected(relay: RelayUrl): void {
    console.log(`🔌 Relay disconnected: ${relay}`)
    // Subscriptions will automatically reconnect when relay comes back
  }

  /**
   * Check if an event matches subscription filters
   */
  private eventMatchesFilters(event: NostrEvent, filters: Filter[]): boolean {
    return filters.some(filter => this.eventMatchesFilter(event, filter))
  }

  /**
   * Check if an event matches a single filter
   */
  private eventMatchesFilter(event: NostrEvent, filter: Filter): boolean {
    // Check kinds
    if (filter.kinds && !filter.kinds.includes(event.kind)) {
      return false
    }

    // Check authors
    if (filter.authors && !filter.authors.includes(event.pubkey)) {
      return false
    }

    // Check IDs
    if (filter.ids && !filter.ids.includes(event.id)) {
      return false
    }

    // Check since/until
    if (filter.since && event.created_at < filter.since) {
      return false
    }

    if (filter.until && event.created_at > filter.until) {
      return false
    }

    // Check tag filters (e.g., #e, #p)
    for (const [key, values] of Object.entries(filter)) {
      if (key.startsWith('#') && Array.isArray(values)) {
        const tagName = key.slice(1)
        const hasMatchingTag = event.tags.some(tag => 
          tag[0] === tagName && values.includes(tag[1])
        )
        if (!hasMatchingTag) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 11)
    return `sub_${timestamp}_${random}`
  }

  /**
   * Simulate subscription for testing (remove when snstr is available)
   */
  private simulateSubscription(subscriptionId: string): void {
    // This is just for testing - simulate some events coming in
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) return

    // Simulate EOSE after 2 seconds
    setTimeout(() => {
      if (subscription.onEose) {
        subscription.onEose(subscriptionId)
      }
    }, 2000)

    // Simulate a few events
    let eventCount = 0
    const eventTimer = setInterval(() => {
      if (!this.subscriptions.has(subscriptionId) || eventCount >= 5) {
        clearInterval(eventTimer)
        return
      }

      const mockEvent: NostrEvent = {
        id: `mock_event_${eventCount}_${Date.now()}`,
        pubkey: 'mock_pubkey_' + Math.random().toString(36).slice(2, 11),
        created_at: Math.floor(Date.now() / 1000),
        kind: 1,
        tags: [],
        content: `Mock event ${eventCount} for subscription ${subscriptionId}`,
        sig: 'mock_signature_' + Math.random().toString(36).slice(2, 22)
      }

      this.handleEvent(mockEvent, 'wss://mock-relay.com')
      eventCount++
    }, 3000)

    subscription.timers.add(eventTimer)
  }

  /**
   * Clean up all resources
   */
  cleanup(): void {
    console.log('🧹 Cleaning up subscription manager...')
    
    // Unsubscribe from all subscriptions
    this.unsubscribeAll()
    
    // Clear event listeners
    this.eventListeners.clear()
    
    // Reset state
    this.globalEventCount = 0
    this.isActive = false
    
    console.log('✅ Subscription manager cleaned up')
  }

  /**
   * Register global event listener
   */
  addEventListener(eventType: string, callback: EventCallback): void {
    const listeners = this.eventListeners.get(eventType) || new Set()
    listeners.add(callback)
    this.eventListeners.set(eventType, listeners)
  }

  /**
   * Remove global event listener
   */
  removeEventListener(eventType: string, callback: EventCallback): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      listeners.delete(callback)
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType)
      }
    }
  }
}

// Export singleton instance
export const subscriptionManager = new SubscriptionManager()

// Initialize when imported
subscriptionManager.initialize().catch(console.error) 