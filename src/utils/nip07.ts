/**
 * NIP-07 browser extension detection and interaction utilities
 * Handles detection of popular Nostr extensions and provides safe interaction methods
 */

import type {
  NostrExtension,
  ExtensionDetection,
  ExtensionType,
  ExtensionCapabilities,
  UnsignedEvent,
  SignedEvent,
} from '@/types/auth'
import type { PublicKey } from '@/types'

/**
 * Detects available NIP-07 extension and determines its type and capabilities
 * @returns Promise<ExtensionDetection> - Detection result with type and capabilities
 */
export async function detectNostrExtension(): Promise<ExtensionDetection> {
  const defaultResult: ExtensionDetection = {
    isAvailable: false,
    type: 'unknown',
    capabilities: {
      getPublicKey: false,
      signEvent: false,
      getRelays: false,
      nip04: false,
      nip44: false,
    },
  }

  // Check if window.nostr exists
  if (!window.nostr) {
    return defaultResult
  }

  const extension = window.nostr

  // Determine extension type based on available methods and user agent
  const extensionType = determineExtensionType(extension)

  // Test capabilities
  const capabilities = await testExtensionCapabilities(extension)

  return {
    isAvailable: true,
    type: extensionType,
    capabilities,
  }
}

/**
 * Determines the type of extension based on available methods and characteristics
 * @param _extension - The nostr extension object (unused for now)
 * @returns ExtensionType - The detected extension type
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function determineExtensionType(_extension: NostrExtension): ExtensionType {
  // These are heuristics based on known extension characteristics
  // In the future, extensions might provide their own identification

  // Check user agent for Alby
  if (navigator.userAgent.includes('Alby')) {
    return 'alby'
  }

  // Check for nos2x specific properties (if any)
  // nos2x is more basic, so it might be the fallback

  // Check for Flamingo specific properties

  // For now, return unknown if we can't determine
  return 'unknown'
}

/**
 * Tests the capabilities of the extension
 * @param extension - The nostr extension object
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
    // Test getPublicKey
    if (typeof extension.getPublicKey === 'function') {
      capabilities.getPublicKey = true
    }

    // Test signEvent
    if (typeof extension.signEvent === 'function') {
      capabilities.signEvent = true
    }

    // Test getRelays
    if (typeof extension.getRelays === 'function') {
      capabilities.getRelays = true
    }

    // Test NIP-04 encryption
    if (
      extension.nip04 &&
      typeof extension.nip04.encrypt === 'function' &&
      typeof extension.nip04.decrypt === 'function'
    ) {
      capabilities.nip04 = true
    }

    // Test NIP-44 encryption
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
 * Safely gets the public key from the extension
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
 * Waits for the extension to be available with timeout
 * @param timeout - Timeout in milliseconds (default: 3000)
 * @returns Promise<boolean> - True if extension becomes available
 */
export async function waitForExtension(timeout: number = 3000): Promise<boolean> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (window.nostr) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return false
}
