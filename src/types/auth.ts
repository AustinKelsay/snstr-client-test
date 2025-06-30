/**
 * Authentication type definitions for NIP-07 browser extension integration
 * Contains interfaces for user authentication, extension detection, and auth state management
 */

import type { PublicKey, HexString } from './index'

// NIP-07 Extension Interface
export interface NostrExtension {
  getPublicKey(): Promise<PublicKey>
  signEvent(event: UnsignedEvent): Promise<SignedEvent>
  getRelays?(): Promise<Record<string, { read: boolean; write: boolean }>>
  nip04?: {
    encrypt(pubkey: PublicKey, plaintext: string): Promise<string>
    decrypt(pubkey: PublicKey, ciphertext: string): Promise<string>
  }
  nip44?: {
    encrypt(pubkey: PublicKey, plaintext: string): Promise<string>
    decrypt(pubkey: PublicKey, ciphertext: string): Promise<string>
  }
}

// Window interface extension for NIP-07
declare global {
  interface Window {
    nostr?: NostrExtension
  }
}

// Nostr Event interfaces
export interface UnsignedEvent {
  kind: number
  content: string
  tags: string[][]
  created_at: number
  pubkey?: PublicKey
}

export interface SignedEvent extends UnsignedEvent {
  id: HexString
  pubkey: PublicKey
  sig: HexString
}

// User profile interface
export interface UserProfile {
  pubkey: PublicKey
  name?: string
  display_name?: string
  about?: string
  picture?: string
  banner?: string
  website?: string
  nip05?: string
  lud16?: string // Lightning address
  lud06?: string // LNURL
}

// Extension capabilities based on NIP-07 standard
export interface ExtensionCapabilities {
  getPublicKey: boolean
  signEvent: boolean
  getRelays: boolean
  nip04: boolean
  nip44: boolean
}

// Extension detection result - focused on capabilities, not brand
export interface ExtensionDetection {
  isAvailable: boolean
  capabilities: ExtensionCapabilities
}

// Authentication state - removed extensionType, focus on capabilities
export interface AuthState {
  isAuthenticated: boolean
  user: UserProfile | null
  publicKey: PublicKey | null
  extensionAvailable: boolean
  extensionCapabilities: ExtensionCapabilities | null
  isLoading: boolean
  error: string | null
}

// Auth context interface
export interface AuthContextType {
  state: AuthState
  login: () => Promise<void>
  logout: () => void
  signEvent: (event: UnsignedEvent) => Promise<SignedEvent>
  detectExtension: () => Promise<ExtensionDetection>
  refreshProfile: () => Promise<void>
}

// Auth action types for reducer
export enum AuthActionType {
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_AUTHENTICATED = 'SET_AUTHENTICATED',
  SET_USER = 'SET_USER',
  SET_EXTENSION = 'SET_EXTENSION',
  LOGOUT = 'LOGOUT',
  CLEAR_ERROR = 'CLEAR_ERROR',
}

// Auth actions - updated to use capabilities instead of extension type
export type AuthAction =
  | { type: AuthActionType.SET_LOADING; payload: boolean }
  | { type: AuthActionType.SET_ERROR; payload: string | null }
  | { type: AuthActionType.SET_AUTHENTICATED; payload: boolean }
  | { type: AuthActionType.SET_USER; payload: UserProfile | null }
  | { type: AuthActionType.SET_EXTENSION; payload: { available: boolean; capabilities: ExtensionCapabilities } }
  | { type: AuthActionType.LOGOUT }
  | { type: AuthActionType.CLEAR_ERROR }
