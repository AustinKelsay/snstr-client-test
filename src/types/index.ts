/**
 * Global type definitions for the snstr-client-test application
 * Contains common interfaces, types, and utility types used throughout the app
 */

// Base types
export type Timestamp = number
export type HexString = string
export type PublicKey = HexString
export type PrivateKey = HexString
export type EventId = HexString
export type RelayUrl = string

// Nostr event types
export interface NostrEvent {
  id: string
  pubkey: PublicKey
  created_at: Timestamp
  kind: number
  tags: string[][]
  content: string
  sig: string
}

export interface Filter {
  ids?: string[]
  authors?: PublicKey[]
  kinds?: number[]
  since?: Timestamp
  until?: Timestamp
  limit?: number
  search?: string
  [key: string]: unknown
}

// Common UI types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean
  error?: string | null
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  success: boolean
}

// Route constants
export const ROUTES = {
  HOME: '/',
  TIMELINE: '/timeline',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  MESSAGES: '/messages',
} as const

export type Route = (typeof ROUTES)[keyof typeof ROUTES]

// Theme types
export type Theme = 'dark' | 'light'

// Post and feed types
export interface Post extends NostrEvent {
  author_name?: string
  author_picture?: string
  author_nip05?: string
  replies_count?: number
  likes_count?: number
  reposts_count?: number
  zaps_count?: number
  is_liked?: boolean
  is_reposted?: boolean
  is_bookmarked?: boolean
  reply_to?: EventId
  root_event?: EventId
  mentions?: PublicKey[]
  hashtags?: string[]
  urls?: string[]
}

export interface PostsState {
  timeline: Post[]
  following: Post[]
  userPosts: Record<PublicKey, Post[]>
  singlePost: Post | null
  postReplies: Record<EventId, Post[]>
  isLoadingTimeline: boolean
  isLoadingFollowing: boolean
  isLoadingSinglePost: boolean
  timelineError: string | null
  followingError: string | null
  singlePostError: string | null
  lastUpdated: Timestamp | null
  hasMoreTimeline: boolean
  hasMoreFollowing: boolean
}

export interface LoadPostsOptions {
  limit?: number
  since?: Timestamp
  until?: Timestamp
  authors?: PublicKey[]
}

export type FeedType = 'discover' | 'following'

// NIP-07 window interface
export interface NostrExtension {
  getPublicKey(): Promise<string>
  signEvent(event: Partial<NostrEvent>): Promise<NostrEvent>
  getRelays?(): Promise<Record<string, { read: boolean; write: boolean }>>
  nip04?: {
    encrypt(pubkey: string, plaintext: string): Promise<string>
    decrypt(pubkey: string, ciphertext: string): Promise<string>
  }
}

declare global {
  interface Window {
    nostr?: NostrExtension
  }
}

// Export re-usable utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
