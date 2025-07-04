/**
 * @fileoverview Cache-related constants
 * Centralized cache configuration values used across the application
 */

/**
 * Profile cache expiration time in seconds
 */
export const PROFILE_CACHE_EXPIRATION_SECONDS = 5 * 60 // 5 minutes

/**
 * Profile cache expiration time in milliseconds
 */
export const PROFILE_CACHE_EXPIRATION_MS = PROFILE_CACHE_EXPIRATION_SECONDS * 1000

/**
 * Event cache expiration time in seconds
 */
export const EVENT_CACHE_EXPIRATION_SECONDS = 10 * 60 // 10 minutes

/**
 * Event cache expiration time in milliseconds
 */
export const EVENT_CACHE_EXPIRATION_MS = EVENT_CACHE_EXPIRATION_SECONDS * 1000

/**
 * Default cache expiration time in seconds (for general use)
 */
export const DEFAULT_CACHE_EXPIRATION_SECONDS = 5 * 60 // 5 minutes

/**
 * Default cache expiration time in milliseconds (for general use)
 */
export const DEFAULT_CACHE_EXPIRATION_MS = DEFAULT_CACHE_EXPIRATION_SECONDS * 1000 