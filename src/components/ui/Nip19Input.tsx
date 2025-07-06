/**
 * @fileoverview Nip19Input component for accepting and validating NIP-19 identifiers
 * Provides real-time validation, formatting, and user feedback for Nostr identifiers
 * Supports all NIP-19 entity types with proper error handling
 */

import React, { useState, useCallback, useEffect } from 'react'
import { Check, AlertCircle, Copy } from 'lucide-react'
import { Input } from './Input'
import { cn } from '@/utils/cn'
import { 
  validatePublicKeyInput, 
  validateEventIdInput, 
  validateNostrIdentifier,
  getInputValidationState,
  type ValidationResult 
} from '@/utils/validation'
import { 
  formatNip19ForDisplay, 
  getEntityDescription, 
  isNip19Entity 
} from '@/utils/nip19'

interface Nip19InputProps {
  /** Current value */
  value: string
  /** Change handler */
  onChange: (value: string, validation: ValidationResult) => void
  /** Entity type to validate */
  entityType?: 'pubkey' | 'event' | 'any'
  /** Placeholder text */
  placeholder?: string
  /** Whether the input is disabled */
  disabled?: boolean
  /** Whether to show real-time validation */
  showValidation?: boolean
  /** Whether to format the display value */
  formatDisplay?: boolean
  /** Whether to show copy button */
  showCopyButton?: boolean
  /** Additional CSS classes */
  className?: string
  /** Label for the input */
  label?: string
  /** Help text */
  helpText?: string
}

/**
 * Nip19Input component provides specialized input for NIP-19 identifiers
 * Features real-time validation, formatting, and user feedback
 * Supports all entity types with proper error handling
 */
export function Nip19Input({
  value,
  onChange,
  entityType = 'any',
  placeholder = 'Enter npub, note, or hex identifier...',
  disabled = false,
  showValidation = true,
  formatDisplay = true,
  showCopyButton = true,
  className,
  label,
  helpText
}: Nip19InputProps) {
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true })
  const [copied, setCopied] = useState(false)

  // Create a stable validation function
  const validateInput = useCallback((inputValue: string, inputEntityType: string): ValidationResult => {
    if (!inputValue.trim()) {
      return { isValid: true }
    }

    switch (inputEntityType) {
      case 'pubkey':
        return validatePublicKeyInput(inputValue)
      case 'event':
        return validateEventIdInput(inputValue)
      default:
        return validateNostrIdentifier(inputValue)
    }
  }, [])

  // Create a stable onChange wrapper to avoid useEffect dependency issues
  const notifyChange = useCallback((inputValue: string, validationResult: ValidationResult) => {
    onChange(inputValue, validationResult)
  }, [onChange])

  // Validate input when value or entityType changes
  useEffect(() => {
    const result = validateInput(value, entityType)
    setValidation(result)
    notifyChange(value, result)
  }, [value, entityType, validateInput, notifyChange])

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // Calculate validation for the new value to avoid stale state issues
    const newValidation = validateInput(newValue, entityType)
    setValidation(newValidation)
    notifyChange(newValue, newValidation)
  }, [validateInput, entityType, notifyChange])

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [value])

  // Get validation state for styling
  const validationState = getInputValidationState(value, entityType)

  // Format display value if needed
  const displayValue = formatDisplay && isNip19Entity(value) 
    ? formatNip19ForDisplay(value, { startChars: 12, endChars: 8, showPrefix: false })
    : value

  // Get entity description for display
  const entityDescription = isNip19Entity(value) ? getEntityDescription(value) : null

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        <Input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pr-12', // Space for validation/copy icons
            validationState === 'valid' && 'border-success focus:border-success focus:ring-success',
            validationState === 'invalid' && 'border-error focus:border-error focus:ring-error'
          )}
        />

        {/* Validation and copy icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Validation icon */}
          {showValidation && value.trim() && (
            <>
              {validationState === 'valid' && (
                <Check className="w-4 h-4 text-success" />
              )}
              {validationState === 'invalid' && (
                <AlertCircle className="w-4 h-4 text-error" />
              )}
            </>
          )}

          {/* Copy button */}
          {showCopyButton && value.trim() && validationState === 'valid' && (
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-bg-active transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-accent-primary" />
              ) : (
                <Copy className="w-4 h-4 text-text-secondary hover:text-text-primary" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Entity type display */}
      {entityDescription && validationState === 'valid' && (
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1 bg-accent-primary/10 text-accent-primary px-2 py-1 rounded">
            <span>{entityDescription}</span>
          </span>
          {formatDisplay && displayValue !== value && (
            <span className="font-mono text-text-tertiary">
              {displayValue}
            </span>
          )}
        </div>
      )}

      {/* Error message */}
      {showValidation && validation.error && (
        <p className="text-sm text-error flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {validation.error}
        </p>
      )}

      {/* Help text */}
      {helpText && !validation.error && (
        <p className="text-sm text-text-secondary">
          {helpText}
        </p>
      )}
    </div>
  )
}

/**
 * PubkeyInput - Specialized component for public key input
 */
export function PubkeyInput({ 
  ...props 
}: Omit<Nip19InputProps, 'entityType'>) {
  return (
    <Nip19Input
      {...props}
      entityType="pubkey"
      placeholder="Enter npub or hex public key..."
      label={props.label || "Public Key"}
      helpText={props.helpText || "Enter a public key in npub or hex format"}
    />
  )
}

/**
 * EventIdInput - Specialized component for event ID input
 */
export function EventIdInput({ 
  ...props 
}: Omit<Nip19InputProps, 'entityType'>) {
  return (
    <Nip19Input
      {...props}
      entityType="event"
      placeholder="Enter note or hex event ID..."
      label={props.label || "Event ID"}
      helpText={props.helpText || "Enter an event ID in note or hex format"}
    />
  )
} 