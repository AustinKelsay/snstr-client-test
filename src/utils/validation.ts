/**
 * @fileoverview Validation utilities for forms and inputs
 * Provides validation functions for Nostr identifiers including NIP-19 support
 * Used across the application for consistent input validation
 */

import { 
  isNip19Entity, 
  extractPubkey,
  extractEventId,
  getEntityType
} from './nip19'
import { isValidPublicKey, isValidEventId } from './nostr'

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
  normalizedValue?: string
  entityType?: string
}

/**
 * Validates a public key input (hex or NIP-19)
 */
export function validatePublicKeyInput(input: string): ValidationResult {
  if (!input || !input.trim()) {
    return { isValid: false, error: 'Public key is required' }
  }

  const trimmed = input.trim()

  // Check if it's a valid NIP-19 entity
  if (isNip19Entity(trimmed)) {
    const extractedPubkey = extractPubkey(trimmed)
    
    if (extractedPubkey) {
      return {
        isValid: true,
        normalizedValue: extractedPubkey,
        entityType: getEntityType(trimmed) || 'npub'
      }
    } else {
      return { 
        isValid: false, 
        error: 'Invalid public key format. Expected npub or nprofile.' 
      }
    }
  }

  // Check if it's a valid hex public key
  if (isValidPublicKey(trimmed)) {
    return {
      isValid: true,
      normalizedValue: trimmed,
      entityType: 'hex'
    }
  }

  return { 
    isValid: false, 
    error: 'Invalid public key format. Expected 64-character hex string, npub, or nprofile.' 
  }
}

/**
 * Validates an event ID input (hex or NIP-19)
 */
export function validateEventIdInput(input: string): ValidationResult {
  if (!input || !input.trim()) {
    return { isValid: false, error: 'Event ID is required' }
  }

  const trimmed = input.trim()

  // Check if it's a valid NIP-19 entity
  if (isNip19Entity(trimmed)) {
    const extractedEventId = extractEventId(trimmed)
    
    if (extractedEventId) {
      return {
        isValid: true,
        normalizedValue: extractedEventId,
        entityType: getEntityType(trimmed) || 'note'
      }
    } else {
      return { 
        isValid: false, 
        error: 'Invalid event ID format. Expected note or nevent.' 
      }
    }
  }

  // Check if it's a valid hex event ID
  if (isValidEventId(trimmed)) {
    return {
      isValid: true,
      normalizedValue: trimmed,
      entityType: 'hex'
    }
  }

  return { 
    isValid: false, 
    error: 'Invalid event ID format. Expected 64-character hex string, note, or nevent.' 
  }
}

/**
 * Validates any Nostr identifier input
 */
export function validateNostrIdentifier(input: string): ValidationResult {
  if (!input || !input.trim()) {
    return { isValid: false, error: 'Identifier is required' }
  }

  const trimmed = input.trim()

  // Try validating as public key first
  const pubkeyResult = validatePublicKeyInput(trimmed)
  if (pubkeyResult.isValid) {
    return pubkeyResult
  }

  // Try validating as event ID
  const eventIdResult = validateEventIdInput(trimmed)
  if (eventIdResult.isValid) {
    return eventIdResult
  }

  return { 
    isValid: false, 
    error: 'Invalid Nostr identifier. Expected public key or event ID in hex or NIP-19 format.' 
  }
}

/**
 * Creates a validation function for specific entity types
 */
export function createEntityValidator(
  entityType: 'pubkey' | 'event' | 'any'
) {
  return (input: string): ValidationResult => {
    switch (entityType) {
      case 'pubkey':
        return validatePublicKeyInput(input)
      case 'event':
        return validateEventIdInput(input)
      case 'any':
        return validateNostrIdentifier(input)
      default:
        return { isValid: false, error: 'Unknown entity type' }
    }
  }
}

/**
 * Form field validation for React Hook Form or similar
 */
export const validationRules = {
  publicKey: {
    required: 'Public key is required',
    validate: (value: string) => {
      const result = validatePublicKeyInput(value)
      return result.isValid || result.error || 'Invalid public key'
    }
  },
  
  eventId: {
    required: 'Event ID is required',
    validate: (value: string) => {
      const result = validateEventIdInput(value)
      return result.isValid || result.error || 'Invalid event ID'
    }
  },
  
  nostrIdentifier: {
    required: 'Identifier is required',
    validate: (value: string) => {
      const result = validateNostrIdentifier(value)
      return result.isValid || result.error || 'Invalid identifier'
    }
  }
}

/**
 * Validates multiple identifiers (for bulk operations)
 */
export function validateMultipleIdentifiers(
  inputs: string[],
  entityType: 'pubkey' | 'event' | 'any' = 'any'
): { valid: string[]; invalid: Array<{ input: string; error: string }> } {
  const validator = createEntityValidator(entityType)
  const valid: string[] = []
  const invalid: Array<{ input: string; error: string }> = []

  for (const input of inputs) {
    const result = validator(input)
    if (result.isValid && result.normalizedValue) {
      valid.push(result.normalizedValue)
    } else {
      invalid.push({ 
        input, 
        error: result.error || 'Invalid identifier' 
      })
    }
  }

  return { valid, invalid }
}

/**
 * Parses a text input that might contain multiple identifiers
 * Supports comma, space, or newline separated values
 */
export function parseMultipleIdentifiers(input: string): string[] {
  if (!input || !input.trim()) return []
  
  return input
    .split(/[,\s\n]+/)
    .map(id => id.trim())
    .filter(id => id.length > 0)
}

/**
 * Helper for real-time input validation in forms
 */
export function getInputValidationState(
  value: string,
  entityType: 'pubkey' | 'event' | 'any' = 'any'
): 'idle' | 'valid' | 'invalid' {
  if (!value || !value.trim()) return 'idle'
  
  const validator = createEntityValidator(entityType)
  const result = validator(value)
  
  return result.isValid ? 'valid' : 'invalid'
} 