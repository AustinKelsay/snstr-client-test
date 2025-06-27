/**
 * NIP-07 browser extension detection and interaction utilities
 * Follows NIP-07 standard for capability-based detection, not brand detection
 * 
 * According to NIP-07 specification, extensions should implement a standard
 * window.nostr interface. We detect capabilities, not extension brands.
 */

import type {
  NostrExtension,
  ExtensionDetection,
  ExtensionCapabilities,
  UnsignedEvent,
  SignedEvent,
} from '@/types/auth'
import type { PublicKey } from '@/types'

/**
 * Detects NIP-07 extension availability and tests its capabilities
 * Following NIP-07 standard, we focus on what the extension can do,
 * not what brand it is
 * 
 * @returns Promise<ExtensionDetection> - Detection result with capabilities
 */
export async function detectNostrExtension(): Promise<ExtensionDetection> {
  const defaultResult: ExtensionDetection = {
    isAvailable: false,
    capabilities: {
      getPublicKey: false,
      signEvent: false,
      getRelays: false,
      nip04: false,
      nip44: false,
    },
  }

  // Check if window.nostr exists (basic NIP-07 requirement)
  if (!window.nostr) {
    return defaultResult
  }

  const extension = window.nostr

  // Test what capabilities the extension actually supports
  const capabilities = await testExtensionCapabilities(extension)

  return {
    isAvailable: true,
    capabilities,
  }
}

/**
 * Tests the capabilities of the NIP-07 extension
 * Checks for each optional and required method per NIP-07 specification
 * 
 * @param extension - The nostr extension object from window.nostr
 * @returns Promise<ExtensionCapabilities> - Available capabilities
 */
async function testExtensionCapabilities(
  extension: NostrExtension
): Promise<ExtensionCapabilities> {
  const capabilities: ExtensionCapabilities = {
    getPublicKey: false,
    signEvent: false,
    getRelays: false,
    nip04: false,
    nip44: false,
  }

  try {
    // Test getPublicKey (required by NIP-07)
    if (typeof extension.getPublicKey === 'function') {
      capabilities.getPublicKey = true
    }

    // Test signEvent (required by NIP-07)
    if (typeof extension.signEvent === 'function') {
      capabilities.signEvent = true
    }

    // Test getRelays (optional per NIP-07)
    if (typeof extension.getRelays === 'function') {
      capabilities.getRelays = true
    }

    // Test NIP-04 encryption (optional per NIP-07)
    if (
      extension.nip04 &&
      typeof extension.nip04.encrypt === 'function' &&
      typeof extension.nip04.decrypt === 'function'
    ) {
      capabilities.nip04 = true
    }

    // Test NIP-44 encryption (optional per NIP-07)
    if (
      extension.nip44 &&
      typeof extension.nip44.encrypt === 'function' &&
      typeof extension.nip44.decrypt === 'function'
    ) {
      capabilities.nip44 = true
    }
  } catch (error) {
    console.warn('Error testing extension capabilities:', error)
  }

  return capabilities
}

/**
 * Simple check for NIP-07 extension availability
 * This is the basic check recommended by NIP-07 spec
 * 
 * @returns boolean - True if window.nostr exists
 */
export function hasNip07Support(): boolean {
  return typeof window !== 'undefined' && !!window.nostr
}

/**
 * Safely gets the public key from the extension
 * Follows NIP-07 standard interface
 * 
 * @returns Promise<PublicKey | null> - The public key or null if failed
 */
export async function getPublicKey(): Promise<PublicKey | null> {
  try {
    if (!window.nostr?.getPublicKey) {
      throw new Error('Extension does not support getPublicKey')
    }

    const pubkey = await window.nostr.getPublicKey()

    // Validate public key format
    if (!isValidPublicKey(pubkey)) {
      throw new Error('Invalid public key format')
    }

    return pubkey
  } catch (error) {
    console.error('Failed to get public key:', error)
    return null
  }
}

/**
 * Safely signs an event using the extension
 * Follows NIP-07 standard interface
 * 
 * @param event - The unsigned event to sign
 * @returns Promise<SignedEvent | null> - The signed event or null if failed
 */
export async function signEvent(event: UnsignedEvent): Promise<SignedEvent | null> {
  try {
    if (!window.nostr?.signEvent) {
      throw new Error('Extension does not support signEvent')
    }

    // Ensure event has required fields
    if (!isValidUnsignedEvent(event)) {
      throw new Error('Invalid event format')
    }

    const signedEvent = await window.nostr.signEvent(event)

    // Validate signed event
    if (!isValidSignedEvent(signedEvent)) {
      throw new Error('Invalid signed event format')
    }

    return signedEvent
  } catch (error) {
    console.error('Failed to sign event:', error)
    return null
  }
}

/**
 * Gets relay configuration from the extension
 * Optional NIP-07 feature - may not be supported by all extensions
 * 
 * @returns Promise<Record<string, { read: boolean; write: boolean }> | null>
 */
export async function getRelays(): Promise<Record<
  string,
  { read: boolean; write: boolean }
> | null> {
  try {
    if (!window.nostr?.getRelays) {
      return null
    }

    const relays = await window.nostr.getRelays()
    return relays
  } catch (error) {
    console.error('Failed to get relays:', error)
    return null
  }
}

/**
 * Encrypts a message using NIP-04 (deprecated but still supported)
 * Only works if extension supports NIP-04
 * 
 * @param pubkey - Recipient's public key
 * @param plaintext - Message to encrypt
 * @returns Promise<string | null> - Encrypted message or null if not supported
 */
export async function encryptNip04(pubkey: PublicKey, plaintext: string): Promise<string | null> {
  try {
    if (!window.nostr?.nip04?.encrypt) {
      throw new Error('Extension does not support NIP-04 encryption')
    }

    return await window.nostr.nip04.encrypt(pubkey, plaintext)
  } catch (error) {
    console.error('Failed to encrypt with NIP-04:', error)
    return null
  }
}

/**
 * Decrypts a message using NIP-04 (deprecated but still supported)
 * Only works if extension supports NIP-04
 * 
 * @param pubkey - Sender's public key
 * @param ciphertext - Message to decrypt
 * @returns Promise<string | null> - Decrypted message or null if failed
 */
export async function decryptNip04(pubkey: PublicKey, ciphertext: string): Promise<string | null> {
  try {
    if (!window.nostr?.nip04?.decrypt) {
      throw new Error('Extension does not support NIP-04 decryption')
    }

    return await window.nostr.nip04.decrypt(pubkey, ciphertext)
  } catch (error) {
    console.error('Failed to decrypt with NIP-04:', error)
    return null
  }
}

/**
 * Encrypts a message using NIP-44 (recommended)
 * Only works if extension supports NIP-44
 * 
 * @param pubkey - Recipient's public key
 * @param plaintext - Message to encrypt
 * @returns Promise<string | null> - Encrypted message or null if not supported
 */
export async function encryptNip44(pubkey: PublicKey, plaintext: string): Promise<string | null> {
  try {
    if (!window.nostr?.nip44?.encrypt) {
      throw new Error('Extension does not support NIP-44 encryption')
    }

    return await window.nostr.nip44.encrypt(pubkey, plaintext)
  } catch (error) {
    console.error('Failed to encrypt with NIP-44:', error)
    return null
  }
}

/**
 * Decrypts a message using NIP-44 (recommended)
 * Only works if extension supports NIP-44
 * 
 * @param pubkey - Sender's public key
 * @param ciphertext - Message to decrypt
 * @returns Promise<string | null> - Decrypted message or null if failed
 */
export async function decryptNip44(pubkey: PublicKey, ciphertext: string): Promise<string | null> {
  try {
    if (!window.nostr?.nip44?.decrypt) {
      throw new Error('Extension does not support NIP-44 decryption')
    }

    return await window.nostr.nip44.decrypt(pubkey, ciphertext)
  } catch (error) {
    console.error('Failed to decrypt with NIP-44:', error)
    return null
  }
}

/**
 * Validates if a string is a valid public key
 * @param pubkey - The public key to validate
 * @returns boolean - True if valid
 */
function isValidPublicKey(pubkey: string): boolean {
  return typeof pubkey === 'string' && pubkey.length === 64 && /^[0-9a-f]{64}$/i.test(pubkey)
}

/**
 * Validates if an object is a valid unsigned event
 * @param event - The event to validate
 * @returns boolean - True if valid
 */
function isValidUnsignedEvent(event: unknown): event is UnsignedEvent {
  return (
    event !== null &&
    typeof event === 'object' &&
    event !== undefined &&
    typeof (event as UnsignedEvent).kind === 'number' &&
    typeof (event as UnsignedEvent).content === 'string' &&
    Array.isArray((event as UnsignedEvent).tags) &&
    typeof (event as UnsignedEvent).created_at === 'number'
  )
}

/**
 * Validates if an object is a valid signed event
 * @param event - The event to validate
 * @returns boolean - True if valid
 */
function isValidSignedEvent(event: unknown): event is SignedEvent {
  return (
    event !== null &&
    typeof event === 'object' &&
    event !== undefined &&
    isValidUnsignedEvent(event) &&
    typeof (event as SignedEvent).id === 'string' &&
    typeof (event as SignedEvent).pubkey === 'string' &&
    typeof (event as SignedEvent).sig === 'string' &&
    isValidPublicKey((event as SignedEvent).pubkey)
  )
}

/**
 * Waits for a NIP-07 extension to become available
 * Useful for pages that load before extensions are ready
 * 
 * @param timeout - Maximum time to wait in milliseconds (default: 3000)
 * @returns Promise<boolean> - True if extension becomes available, false if timeout
 */
export async function waitForExtension(timeout: number = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if already available
    if (hasNip07Support()) {
      resolve(true)
      return
    }

    let attempts = 0
    const maxAttempts = timeout / 100 // Check every 100ms

    const checkInterval = setInterval(() => {
      attempts++
      
      if (hasNip07Support()) {
        clearInterval(checkInterval)
        resolve(true)
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
        resolve(false)
      }
    }, 100)
  })
}
