/**
 * @fileoverview Shared types for Nostr features
 * Contains common interfaces and types used across Nostr modules
 * Provides single source of truth for type definitions
 */

import type { RelayUrl } from '@/types'

/**
 * Relay connection status interface
 * Used for tracking relay health and connection state
 */
export interface RelayStatus {
  /** Relay URL */
  url: RelayUrl
  /** Whether currently connected to relay */
  connected: boolean
  /** Whether currently attempting to connect */
  connecting: boolean
  /** Last error message if connection failed */
  error?: string
  /** Date of last successful connection */
  lastConnected?: Date
  /** Number of connection attempts made */
  attempts: number
  /** Average latency to relay in milliseconds */
  latency?: number
  /** Total number of messages received from relay */
  messageCount: number
}

/**
 * Relay connection configuration
 */
export interface RelayConfig {
  /** Relay URL */
  url: RelayUrl
  /** Whether to read events from this relay */
  read: boolean
  /** Whether to write events to this relay */
  write: boolean
  /** Whether this relay is enabled */
  enabled: boolean
  /** Priority level for relay selection */
  priority: number
}

/**
 * Relay health metrics for monitoring
 */
export interface RelayHealth {
  /** Relay URL */
  url: RelayUrl
  /** Uptime percentage (0-100) */
  uptime: number
  /** Average latency in milliseconds */
  averageLatency: number
  /** Error rate percentage (0-100) */
  errorRate: number
  /** Message rate (messages per second) */
  messageRate: number
  /** Last time relay was active */
  lastActive: Date
}

/**
 * Subscription configuration options
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