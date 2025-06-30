/**
 * @fileoverview Nostr utility functions
 * Provides helper functions for event processing, validation, formatting,
 * and common Nostr protocol operations
 */

import type { NostrEvent, PublicKey, Timestamp } from '@/types'

/**
 * Validates a hex string format
 */
export function isValidHex(hex: string, expectedLength?: number): boolean {
  if (!hex || typeof hex !== 'string') {
    return false
  }
  
  const hexRegex = /^[0-9a-f]+$/i
  if (!hexRegex.test(hex)) {
    return false
  }
  
  if (expectedLength && hex.length !== expectedLength) {
    return false
  }
  
  return true
}

/**
 * Validates a Nostr public key format
 */
export function isValidPublicKey(pubkey: string): boolean {
  return isValidHex(pubkey, 64)
}

/**
 * Validates a Nostr event ID format
 */
export function isValidEventId(eventId: string): boolean {
  return isValidHex(eventId, 64)
}

/**
 * Validates a Nostr signature format
 */
export function isValidSignature(signature: string): boolean {
  return isValidHex(signature, 128)
}

/**
 * Validates a relay URL format
 */
export function isValidRelayUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }
  
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'ws:' || parsed.protocol === 'wss:'
  } catch {
    return false
  }
}

/**
 * Normalizes a relay URL by removing trailing slashes and converting to lowercase
 */
export function normalizeRelayUrl(url: string): string {
  return url.toLowerCase().replace(/\/+$/, '')
}

/**
 * Formats a timestamp into a human-readable relative time
 */
export function formatRelativeTime(timestamp: Timestamp): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  
  if (diff < 0) {
    return 'in the future'
  }
  
  if (diff < 60) {
    return `${diff}s ago`
  }
  
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60)
    return `${minutes}m ago`
  }
  
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600)
    return `${hours}h ago`
  }
  
  if (diff < 2592000) {
    const days = Math.floor(diff / 86400)
    return `${days}d ago`
  }
  
  if (diff < 31536000) {
    const months = Math.floor(diff / 2592000)
    return `${months}mo ago`
  }
  
  const years = Math.floor(diff / 31536000)
  return `${years}y ago`
}

/**
 * Formats a timestamp into a readable date string
 */
export function formatDate(timestamp: Timestamp, includeTime = true): string {
  const date = new Date(timestamp * 1000)
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  
  return date.toLocaleDateString(undefined, options)
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Truncates a public key for display purposes
 */
export function truncatePubkey(pubkey: PublicKey, startChars = 8, endChars = 8): string {
  if (pubkey.length <= startChars + endChars) {
    return pubkey
  }
  
  return `${pubkey.slice(0, startChars)}...${pubkey.slice(-endChars)}`
}

/**
 * Truncates an event ID for display purposes
 */
export function truncateEventId(eventId: string, startChars = 8, endChars = 8): string {
  return truncatePubkey(eventId, startChars, endChars)
}

/**
 * Extract hashtags from text content
 */
export function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[\w]+/g
  const matches = content.match(hashtagRegex)
  
  if (!matches) {
    return []
  }
  
  // Remove the # and convert to lowercase, remove duplicates
  return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))]
}

/**
 * Extract mentions from text content
 */
export function extractMentions(content: string): string[] {
  // Simple regex for @username mentions
  const mentionRegex = /@[\w]+/g
  const matches = content.match(mentionRegex)
  
  if (!matches) {
    return []
  }
  
  // Remove the @ and convert to lowercase, remove duplicates
  return [...new Set(matches.map(mention => mention.slice(1).toLowerCase()))]
}

/**
 * Extract URLs from text content
 */
export function extractUrls(content: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g
  const matches = content.match(urlRegex)
  
  return matches ? [...new Set(matches)] : []
}

/**
 * Sanitize text content by removing potentially harmful elements
 */
export function sanitizeContent(content: string): string {
  // Remove HTML tags and trim
  const sanitized = content
    .replace(/<[^>]*>/g, '')
    .trim()
  
  return sanitized
}

/**
 * Parse and linkify text content with hashtags, mentions, and URLs
 */
export function parseTextContent(content: string): Array<{
  type: 'text' | 'hashtag' | 'mention' | 'url'
  content: string
  href?: string
}> {
  const result: Array<{
    type: 'text' | 'hashtag' | 'mention' | 'url'
    content: string
    href?: string
  }> = []
  
  // Combined regex for hashtags, mentions, and URLs
  const combinedRegex = /(#[\w]+|@[\w]+|https?:\/\/[^\s]+)/g
  let lastIndex = 0
  let match
  
  while ((match = combinedRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      })
    }
    
    const matchText = match[0]
    
    if (matchText.startsWith('#')) {
      result.push({
        type: 'hashtag',
        content: matchText,
        href: `/search?q=${encodeURIComponent(matchText)}`
      })
    } else if (matchText.startsWith('@')) {
      result.push({
        type: 'mention',
        content: matchText,
        href: `/profile/${matchText.slice(1)}`
      })
    } else if (matchText.startsWith('http')) {
      result.push({
        type: 'url',
        content: matchText,
        href: matchText
      })
    }
    
    lastIndex = match.index + matchText.length
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    result.push({
      type: 'text',
      content: content.slice(lastIndex)
    })
  }
  
  return result
}

/**
 * Calculate content statistics
 */
export function getContentStats(content: string): {
  characters: number
  words: number
  lines: number
  hashtags: number
  mentions: number
  urls: number
} {
  const hashtags = extractHashtags(content)
  const mentions = extractMentions(content)
  const urls = extractUrls(content)
  const words = content.trim().split(/\s+/).filter(word => word.length > 0)
  const lines = content.split('\n')
  
  return {
    characters: content.length,
    words: words.length,
    lines: lines.length,
    hashtags: hashtags.length,
    mentions: mentions.length,
    urls: urls.length
  }
}

/**
 * Check if content exceeds reasonable limits
 */
export function validateContentLength(content: string, maxLength = 5000): {
  isValid: boolean
  length: number
  maxLength: number
  error?: string
} {
  const length = content.length
  
  if (length > maxLength) {
    return {
      isValid: false,
      length,
      maxLength,
      error: `Content too long: ${length}/${maxLength} characters`
    }
  }
  
  return {
    isValid: true,
    length,
    maxLength
  }
}

/**
 * Generate a deterministic color for a public key (for avatars)
 */
export function pubkeyToColor(pubkey: PublicKey): string {
  // Use first 6 characters of pubkey as hex color
  const hex = pubkey.slice(0, 6)
  return `#${hex}`
}

/**
 * Generate initials from a name for avatar fallback
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') {
    return '?'
  }
  
  const words = name.trim().split(/\s+/)
  
  if (words.length === 0) {
    return '?'
  }
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

/**
 * Check if a timestamp is recent (within the last hour)
 */
export function isRecentTimestamp(timestamp: Timestamp): boolean {
  const now = Math.floor(Date.now() / 1000)
  const hourAgo = now - 3600
  return timestamp > hourAgo
}

/**
 * Check if a timestamp is from today
 */
export function isToday(timestamp: Timestamp): boolean {
  const date = new Date(timestamp * 1000)
  const today = new Date()
  
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

/**
 * Get age category for relative time display
 */
export function getTimeCategory(timestamp: Timestamp): 'recent' | 'today' | 'week' | 'month' | 'old' {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  
  if (diff < 3600) return 'recent' // Last hour
  if (isToday(timestamp)) return 'today'
  if (diff < 604800) return 'week' // Last week
  if (diff < 2592000) return 'month' // Last month
  return 'old'
}

/**
 * Sort events by timestamp with proper handling of equal timestamps
 */
export function sortEventsByTime(events: NostrEvent[], ascending = false): NostrEvent[] {
  return [...events].sort((a, b) => {
    const timeDiff = ascending ? a.created_at - b.created_at : b.created_at - a.created_at
    
    // If timestamps are equal, sort by event ID for deterministic ordering
    if (timeDiff === 0) {
      return a.id.localeCompare(b.id)
    }
    
    return timeDiff
  })
}

/**
 * Create a simple event filter for common use cases
 */
export function createSimpleFilter(options: {
  kinds?: number[]
  authors?: PublicKey[]
  since?: Timestamp
  limit?: number
}): object {
  const filter: Record<string, unknown> = {}
  
  if (options.kinds) {
    filter.kinds = options.kinds
  }
  
  if (options.authors) {
    filter.authors = options.authors
  }
  
  if (options.since) {
    filter.since = options.since
  }
  
  if (options.limit) {
    filter.limit = options.limit
  }
  
  return filter
}

/**
 * Check if an event is considered spam based on simple heuristics
 */
export function isLikelySpam(event: NostrEvent): boolean {
  const content = event.content.toLowerCase()
  
  // Check for excessive repetitive characters
  if (/(.)\1{10,}/.test(content)) {
    return true
  }
  
  // Check for excessive hashtags
  const hashtags = extractHashtags(event.content)
  if (hashtags.length > 10) {
    return true
  }
  
  // Check for excessive URLs
  const urls = extractUrls(event.content)
  if (urls.length > 5) {
    return true
  }
  
  // Check for very short content with only URLs
  if (event.content.trim().length < 20 && urls.length > 0) {
    return true
  }
  
  return false
}

/**
 * Debounce function for limiting rapid function calls
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = undefined
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for limiting function call frequency
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
} 