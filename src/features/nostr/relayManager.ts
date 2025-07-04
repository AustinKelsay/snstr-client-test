/**
 * @fileoverview Relay management system for Nostr connections
 * Handles multiple relay connections, status tracking, and automatic reconnection
 * Provides a high-level interface for managing relay health and performance
 */

import type { RelayUrl } from '@/types'
import type { RelayStatus, RelayConfig, RelayHealth } from './types'

/**
 * Relay manager configuration
 */
export interface RelayManagerConfig {
  connectionTimeout: number
  reconnectDelay: number
  maxReconnectAttempts: number
  healthCheckInterval: number
  minActiveRelays: number
}

/**
 * Default relay configuration
 */
const DEFAULT_CONFIG: RelayManagerConfig = {
  connectionTimeout: 10000, // 10 seconds
  reconnectDelay: 5000, // 5 seconds
  maxReconnectAttempts: 3,
  healthCheckInterval: 30000, // 30 seconds
  minActiveRelays: 2
}

/**
 * Default relay list
 */
export const DEFAULT_RELAYS: RelayConfig[] = [
  {
    url: 'wss://relay.nostr.band',
    read: true,
    write: true,
    enabled: true,
    priority: 1
  },
  {
    url: 'wss://nos.lol',
    read: true,
    write: true,
    enabled: true,
    priority: 2
  },
  {
    url: 'wss://relay.damus.io',
    read: true,
    write: true,
    enabled: true,
    priority: 3
  },
  {
    url: 'wss://nostr.wine',
    read: true,
    write: false,
    enabled: true,
    priority: 4
  },
  {
    url: 'wss://relay.snort.social',
    read: true,
    write: true,
    enabled: true,
    priority: 5
  }
]

/**
 * Relay manager class for handling multiple relay connections
 */
export class RelayManager {
  private relays: Map<RelayUrl, RelayConfig> = new Map()
  private statuses: Map<RelayUrl, RelayStatus> = new Map()
  private health: Map<RelayUrl, RelayHealth> = new Map()
  private reconnectTimers: Map<RelayUrl, NodeJS.Timeout> = new Map()
  private healthCheckTimer?: NodeJS.Timeout
  private config: RelayManagerConfig
  private eventHandlers: Map<string, ((relay: RelayUrl, data?: unknown) => void)[]> = new Map()

  constructor(config: Partial<RelayManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initializeDefaultRelays()
    this.startHealthChecking()
  }

  /**
   * Initialize with default relays
   */
  private initializeDefaultRelays(): void {
    DEFAULT_RELAYS.forEach(relay => {
      this.addRelay(relay)
    })
  }

  /**
   * Add a relay to the manager
   */
  addRelay(config: RelayConfig): void {
    this.relays.set(config.url, config)
    this.statuses.set(config.url, {
      url: config.url,
      connected: false,
      connecting: false,
      attempts: 0,
      messageCount: 0
    })
    this.health.set(config.url, {
      url: config.url,
      uptime: 0,
      averageLatency: 0,
      errorRate: 0,
      messageRate: 0,
      lastActive: new Date()
    })

    console.log(`📡 Added relay: ${config.url}`)
  }

  /**
   * Remove a relay from the manager
   */
  removeRelay(url: RelayUrl): void {
    this.relays.delete(url)
    this.statuses.delete(url)
    this.health.delete(url)
    
    // Clear reconnection timer
    const timer = this.reconnectTimers.get(url)
    if (timer) {
      clearTimeout(timer)
      this.reconnectTimers.delete(url)
    }

    console.log(`🗑️ Removed relay: ${url}`)
  }

  /**
   * Update relay configuration
   */
  updateRelay(url: RelayUrl, updates: Partial<RelayConfig>): void {
    const current = this.relays.get(url)
    if (current) {
      this.relays.set(url, { ...current, ...updates })
      console.log(`🔧 Updated relay config: ${url}`)
    }
  }

  /**
   * Get relay configuration
   */
  getRelay(url: RelayUrl): RelayConfig | undefined {
    return this.relays.get(url)
  }

  /**
   * Get all relay configurations
   */
  getAllRelays(): RelayConfig[] {
    return Array.from(this.relays.values())
  }

  /**
   * Get relay status
   */
  getRelayStatus(url: RelayUrl): RelayStatus | undefined {
    return this.statuses.get(url)
  }

  /**
   * Get all relay statuses
   */
  getAllStatuses(): RelayStatus[] {
    return Array.from(this.statuses.values())
  }

  /**
   * Get connected relays
   */
  getConnectedRelays(): RelayUrl[] {
    return Array.from(this.statuses.entries())
      .filter(([, status]) => status.connected)
      .map(([url]) => url)
  }

  /**
   * Get read relays (connected and enabled for reading)
   */
  getReadRelays(): RelayUrl[] {
    return Array.from(this.relays.entries())
      .filter(([url, config]) => {
        const status = this.statuses.get(url)
        return config.read && config.enabled && status?.connected
      })
      .map(([url]) => url)
  }

  /**
   * Get write relays (connected and enabled for writing)
   */
  getWriteRelays(): RelayUrl[] {
    return Array.from(this.relays.entries())
      .filter(([url, config]) => {
        const status = this.statuses.get(url)
        return config.write && config.enabled && status?.connected
      })
      .map(([url]) => url)
  }

  /**
   * Update relay status
   */
  updateStatus(url: RelayUrl, updates: Partial<RelayStatus>): void {
    const current = this.statuses.get(url)
    if (current) {
      const updated = { ...current, ...updates }
      this.statuses.set(url, updated)
      
      // Update health metrics
      this.updateHealth(url, updated)
      
      // Emit status change event
      this.emit('statusChange', url, updated)
    }
  }

  /**
   * Update relay health metrics
   */
  private updateHealth(url: RelayUrl, status: RelayStatus): void {
    const health = this.health.get(url)
    if (health) {
      const now = new Date()
      
      // Update uptime
      if (status.connected) {
        health.uptime = Math.min(health.uptime + 1, 100)
        health.lastActive = now
      } else {
        health.uptime = Math.max(health.uptime - 1, 0)
      }
      
      // Update message rate
      health.messageRate = status.messageCount / 
        Math.max((now.getTime() - health.lastActive.getTime()) / 1000, 1)
      
      this.health.set(url, health)
    }
  }

  /**
   * Get relay health metrics
   */
  getRelayHealth(url: RelayUrl): RelayHealth | undefined {
    return this.health.get(url)
  }

  /**
   * Get all relay health metrics
   */
  getAllHealth(): RelayHealth[] {
    return Array.from(this.health.values())
  }

  /**
   * Test relay connection with actual WebSocket
   */
  async testRelay(url: RelayUrl): Promise<boolean> {
    console.log(`🔍 Testing relay: ${url}`)
    
    try {
      const startTime = Date.now()
      
      // Create a WebSocket connection test
      const testSuccess = await this.performWebSocketTest(url)
      
      if (testSuccess) {
        const latency = Date.now() - startTime
        
        this.updateStatus(url, {
          connected: true,
          connecting: false,
          error: undefined,
          lastConnected: new Date(),
          attempts: 0,
          latency
        })
        
        console.log(`✅ Relay test passed for ${url} (${latency}ms)`)
        return true
      } else {
        throw new Error('WebSocket connection test failed')
      }
    } catch (error) {
      console.error(`❌ Relay test failed for ${url}:`, error)
      
      this.updateStatus(url, {
        connected: false,
        connecting: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      })
      
      return false
    }
  }

  /**
   * Perform actual WebSocket connection test
   */
  private async performWebSocketTest(url: RelayUrl): Promise<boolean> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        ws.close()
        resolve(false)
      }, this.config.connectionTimeout)

      const ws = new WebSocket(url)
      
      ws.onopen = () => {
        clearTimeout(timeoutId)
        ws.close()
        resolve(true)
      }

      ws.onerror = () => {
        clearTimeout(timeoutId)
        ws.close()
        resolve(false)
      }

      ws.onclose = () => {
        clearTimeout(timeoutId)
      }
    })
  }

  /**
   * Start health checking interval
   */
  private startHealthChecking(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
    }
    
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck()
    }, this.config.healthCheckInterval)
  }

  /**
   * Perform health check on all relays
   */
  private performHealthCheck(): void {
    console.log('🏥 Performing relay health check...')
    
    this.relays.forEach(async (config, url) => {
      if (config.enabled) {
        const status = this.statuses.get(url)
        if (status && !status.connected && !status.connecting) {
          // Try to reconnect disconnected relays
          await this.reconnectRelay(url)
        }
      }
    })
  }

  /**
   * Reconnect to a specific relay
   */
  private async reconnectRelay(url: RelayUrl): Promise<void> {
    const status = this.statuses.get(url)
    if (!status || status.attempts >= this.config.maxReconnectAttempts) {
      return
    }

    console.log(`🔄 Attempting to reconnect to ${url} (attempt ${status.attempts + 1})`)
    
    this.updateStatus(url, {
      connecting: true,
      attempts: status.attempts + 1
    })

    const success = await this.testRelay(url)
    
    if (!success) {
      // Schedule next reconnection attempt
      const timer = setTimeout(() => {
        this.reconnectRelay(url)
        this.reconnectTimers.delete(url)
      }, this.config.reconnectDelay)
      
      this.reconnectTimers.set(url, timer)
    }
  }

  /**
   * Register event handler
   */
  on(event: string, handler: (relay: RelayUrl, data?: unknown) => void): void {
    const handlers = this.eventHandlers.get(event) || []
    handlers.push(handler)
    this.eventHandlers.set(event, handlers)
  }

  /**
   * Emit event to handlers
   */
  private emit(event: string, relay: RelayUrl, data?: unknown): void {
    const handlers = this.eventHandlers.get(event) || []
    handlers.forEach(handler => {
      try {
        handler(relay, data)
      } catch (error) {
        console.error(`Error in ${event} handler:`, error)
      }
    })
  }

  /**
   * Get relay recommendations based on health
   */
  getRecommendedRelays(count = 3): RelayUrl[] {
    return Array.from(this.health.entries())
      .filter(([url]) => {
        const config = this.relays.get(url)
        const status = this.statuses.get(url)
        return config?.enabled && status?.connected
      })
      .sort(([, a], [, b]) => {
        // Sort by uptime and low latency
        const scoreA = a.uptime - (a.averageLatency / 1000)
        const scoreB = b.uptime - (b.averageLatency / 1000)
        return scoreB - scoreA
      })
      .slice(0, count)
      .map(([url]) => url)
  }

  /**
   * Check if minimum relay requirements are met
   */
  hasMinimumRelays(): boolean {
    return this.getConnectedRelays().length >= this.config.minActiveRelays
  }

  /**
   * Get relay statistics
   */
  getStats(): {
    total: number
    connected: number
    connecting: number
    enabled: number
    readRelays: number
    writeRelays: number
  } {
    const all = this.getAllStatuses()
    const configs = this.getAllRelays()
    
    return {
      total: all.length,
      connected: all.filter(s => s.connected).length,
      connecting: all.filter(s => s.connecting).length,
      enabled: configs.filter(c => c.enabled).length,
      readRelays: this.getReadRelays().length,
      writeRelays: this.getWriteRelays().length
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    // Clear health check timer
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
    }
    
    // Clear reconnection timers
    this.reconnectTimers.forEach(timer => clearTimeout(timer))
    this.reconnectTimers.clear()
    
    // Clear event handlers
    this.eventHandlers.clear()
    
    console.log('🧹 Relay manager cleaned up')
  }
}

// Export singleton instance
export const relayManager = new RelayManager() 