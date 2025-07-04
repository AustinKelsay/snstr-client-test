/**
 * @fileoverview Global type definitions
 * Provides TypeScript typing for browser globals and extensions
 */

/**
 * Unsigned Nostr event for signing
 */
interface UnsignedNostrEvent {
  kind: number
  content: string
  tags: string[][]
  created_at: number
  pubkey?: string
}

/**
 * Signed Nostr event
 */
interface SignedNostrEvent extends UnsignedNostrEvent {
  id: string
  pubkey: string
  sig: string
}

/**
 * NIP-07 Nostr browser extension interface
 */
interface NostrExtension {
  /** Get the user's public key */
  getPublicKey(): Promise<string>
  
  /** Sign an event */
  signEvent(event: UnsignedNostrEvent): Promise<SignedNostrEvent>
  
  /** Get user's relay list */
  getRelays?(): Promise<Record<string, { read: boolean; write: boolean }>>
  
  /** NIP-04 encryption methods */
  nip04?: {
    encrypt(pubkey: string, plaintext: string): Promise<string>
    decrypt(pubkey: string, ciphertext: string): Promise<string>
  }
  
  /** NIP-44 encryption methods */
  nip44?: {
    encrypt(pubkey: string, plaintext: string): Promise<string>
    decrypt(pubkey: string, ciphertext: string): Promise<string>
  }
}

/**
 * Extend the global Window interface to include Nostr extension
 */
declare global {
  interface Window {
    /** NIP-07 Nostr browser extension */
    nostr?: NostrExtension
  }
} 