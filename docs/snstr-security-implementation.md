# SNSTR Security Functions Implementation

## Overview

Based on feedback from the SNSTR library developer, the security filtering functions requested in our feature request are **already implemented** in the SNSTR library. This document outlines how to update our client to use these built-in security functions.

## Available SNSTR Security Functions

The following functions are available in the SNSTR library:

### Core Security Functions
- `filterProfile(profileData: any): ProfileData` - Sanitize nprofile entities
- `filterEvent(eventData: any): EventData` - Sanitize nevent entities  
- `filterAddress(addressData: any): AddressData` - Sanitize naddr entities
- `filterEntity(entityData: any, entityType: string): any` - Generic entity filtering
- `isValidRelayUrl(url: string): boolean` - Comprehensive relay URL validation

### Security Features
The SNSTR implementation includes advanced security features:
- **URL Validation**: Enforces `wss://` or `ws://` protocols only
- **Credential Rejection**: Blocks URLs with embedded username/password
- **Null Byte Detection**: Prevents null byte injection attacks
- **Control Character Filtering**: Blocks dangerous control characters
- **Port Validation**: Validates port numbers (1-65535)
- **Length Limits**: 512 characters max for relay URLs, 1024 for identifiers
- **TLV Entry Limits**: Maximum 20 TLV entries to prevent DoS attacks

## Current Implementation Status

### ✅ Implemented (Temporary)
Our codebase currently implements temporary security filtering functions that mirror the SNSTR functionality:

**Files Updated:**
- `src/utils/nip19.ts` - Enhanced safe decoding with security filtering
- `src/utils/nostr.ts` - Enhanced relay URL validation

**Current Safe Decoding Pattern:**
```typescript
// This follows the recommended SNSTR pattern
export function safeDecodeEntity(entity: string): any {
  try {
    const result = decode(entity as any)
    
    // Simple types don't need filtering (npub, nsec, note)
    if (['npub', 'nsec', 'note'].includes(result.type)) {
      return result
    }
    
    // Complex types need security filtering
    if (['nprofile', 'nevent', 'naddr'].includes(result.type)) {
      return {
        ...result,
        data: filterDecodedEntity(result.data, result.type)
      }
    }
    
    return result
  } catch (error) {
    console.warn('Failed to decode NIP-19 entity:', entity, error)
    return null
  }
}
```

### 🔄 Migration Plan

When the SNSTR security functions become available in our version, follow these steps:

#### Step 1: Update Imports
```typescript
// Replace this in src/utils/nip19.ts:
import { isValidRelayUrl } from './nostr'

// With this:
import { 
  filterProfile,
  filterEvent,
  filterAddress,
  filterEntity,
  isValidRelayUrl
} from 'snstr'
```

#### Step 2: Replace Temporary Functions
Remove these temporary functions from `src/utils/nip19.ts`:
- `filterDecodedEntity()`
- `filterProfileData()`
- `filterEventData()`
- `filterAddressData()`

#### Step 3: Update Safe Decoding
```typescript
// Replace the current implementation with:
export function safeDecodeEntity(entity: string): any {
  try {
    const result = decode(entity as any)
    
    // Simple types don't need filtering
    if (['npub', 'nsec', 'note'].includes(result.type)) {
      return result
    }
    
    // Use SNSTR's built-in filtering for complex types
    if (['nprofile', 'nevent', 'naddr'].includes(result.type)) {
      return {
        ...result,
        data: filterEntity(result.data, result.type)
      }
    }
    
    return result
  } catch (error) {
    console.warn('Failed to decode NIP-19 entity:', entity, error)
    return null
  }
}
```

#### Step 4: Update Relay Validation
Replace the custom `isValidRelayUrl` in `src/utils/nostr.ts` with:
```typescript
// Import from SNSTR instead of local implementation
export { isValidRelayUrl } from 'snstr'
```

#### Step 5: Add Direct Security Usage
Use the security functions directly where needed:
```typescript
// For decoded profiles
const safeProfile = filterProfile(decodedProfile.data)

// For decoded events  
const safeEvent = filterEvent(decodedEvent.data)

// For decoded addresses
const safeAddress = filterAddress(decodedAddress.data)

// For individual relay URLs
if (isValidRelayUrl('wss://relay.example.com')) {
  // URL is safe to use
}
```

## Testing the Migration

### Verification Checklist
- [ ] All NIP-19 entity decoding uses security filtering
- [ ] Relay URLs are validated before use
- [ ] No custom security functions remain (replaced with SNSTR functions)
- [ ] All imports updated to use SNSTR security functions
- [ ] Error handling preserves existing behavior

### Test Cases
1. **Malicious nprofile with invalid relay URLs** - Should filter out invalid relays
2. **nevent with embedded credentials** - Should remove dangerous URLs
3. **naddr with oversized identifiers** - Should validate field lengths  
4. **Relay URLs with null bytes** - Should reject malicious URLs
5. **Profile data with missing pubkey** - Should throw validation error

## Security Benefits

Using SNSTR's built-in security functions provides:

1. **Comprehensive Validation** - Beyond basic protocol checks
2. **Attack Prevention** - Protects against known attack vectors
3. **Consistent Security** - Same validation across all Nostr clients using SNSTR
4. **Maintenance** - Security updates handled by SNSTR library
5. **Performance** - Optimized validation logic

## Files That Need Updates

### Primary Files
- `src/utils/nip19.ts` - Remove temporary functions, update imports
- `src/utils/nostr.ts` - Replace custom relay validation

### Secondary Files (Review for security improvements)
- `src/store/slices/contactsSlice.ts` - Contact list relay validation
- `src/store/slices/profilesSlice.ts` - Profile metadata validation
- `src/features/nostr/eventHandlers.ts` - Event processing validation

## Notes

- The temporary implementation maintains the same security level as SNSTR's functions
- Migration should be straightforward with minimal breaking changes
- All existing error handling and logging will be preserved
- Performance should improve with SNSTR's optimized implementations

## References

- [SNSTR NIP-19 Documentation](../docs/snstr_nip01_readme.md)
- [SNSTR Security Examples](examples/nip19/nip19-security.ts)
- [Feature Request Analysis](../docs/snstr-feature-request.md) 