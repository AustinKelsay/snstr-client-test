# SNSTR Library Feature Request: Security Filtering & Utility Functions

## Overview

While building a production Nostr client with the SNSTR library, we identified several missing security and utility functions that would significantly improve developer experience and application security. These functions would help developers safely handle decoded NIP-19 entities and validate relay URLs.

## Missing Functions & Use Cases

### 1. Security Filtering Functions

#### `filterProfile(profileData: any): ProfileData`
**Purpose**: Sanitize and validate decoded nprofile data structures
**Current Gap**: When decoding `nprofile` entities, there's no built-in way to ensure the returned data is safe and contains only expected fields.

**Proposed Implementation**:
```typescript
interface ProfileData {
  pubkey: string;
  relays?: string[];
}

function filterProfile(data: any): ProfileData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid profile data');
  }
  
  const { pubkey, relays } = data;
  
  // Validate pubkey
  if (!pubkey || typeof pubkey !== 'string' || !/^[0-9a-f]{64}$/i.test(pubkey)) {
    throw new Error('Invalid pubkey in profile');
  }
  
  // Validate relays if present
  const validRelays = relays?.filter(isValidRelayUrl) || [];
  
  return {
    pubkey,
    ...(validRelays.length > 0 && { relays: validRelays })
  };
}
```

#### `filterEvent(eventData: any): EventData`
**Purpose**: Sanitize and validate decoded nevent data structures
**Current Gap**: Similar to profiles, nevent entities can contain various fields that need validation.

**Proposed Implementation**:
```typescript
interface EventData {
  id: string;
  relays?: string[];
  author?: string;
  kind?: number;
}

function filterEvent(data: any): EventData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid event data');
  }
  
  const { id, relays, author, kind } = data;
  
  // Validate event ID
  if (!id || typeof id !== 'string' || !/^[0-9a-f]{64}$/i.test(id)) {
    throw new Error('Invalid event ID');
  }
  
  // Validate author if present
  if (author && (typeof author !== 'string' || !/^[0-9a-f]{64}$/i.test(author))) {
    throw new Error('Invalid author pubkey');
  }
  
  // Validate kind if present
  if (kind !== undefined && (typeof kind !== 'number' || kind < 0)) {
    throw new Error('Invalid event kind');
  }
  
  // Validate relays if present
  const validRelays = relays?.filter(isValidRelayUrl) || [];
  
  return {
    id,
    ...(validRelays.length > 0 && { relays: validRelays }),
    ...(author && { author }),
    ...(kind !== undefined && { kind })
  };
}
```

#### `filterAddress(addressData: any): AddressData`
**Purpose**: Sanitize and validate decoded naddr data structures

**Proposed Implementation**:
```typescript
interface AddressData {
  identifier: string;
  pubkey: string;
  kind: number;
  relays?: string[];
}

function filterAddress(data: any): AddressData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid address data');
  }
  
  const { identifier, pubkey, kind, relays } = data;
  
  // Validate required fields
  if (!identifier || typeof identifier !== 'string') {
    throw new Error('Invalid identifier');
  }
  
  if (!pubkey || typeof pubkey !== 'string' || !/^[0-9a-f]{64}$/i.test(pubkey)) {
    throw new Error('Invalid pubkey');
  }
  
  if (typeof kind !== 'number' || kind < 0) {
    throw new Error('Invalid kind');
  }
  
  // Validate relays if present
  const validRelays = relays?.filter(isValidRelayUrl) || [];
  
  return {
    identifier,
    pubkey,
    kind,
    ...(validRelays.length > 0 && { relays: validRelays })
  };
}
```

### 2. Relay URL Validation

#### `isValidRelayUrl(url: string): boolean`
**Purpose**: Validate WebSocket relay URLs according to Nostr standards
**Current Gap**: No built-in way to validate relay URLs when working with complex entities.

**Proposed Implementation**:
```typescript
function isValidRelayUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const parsed = new URL(url);
    
    // Must be WebSocket protocol
    if (parsed.protocol !== 'ws:' && parsed.protocol !== 'wss:') {
      return false;
    }
    
    // Must have a host
    if (!parsed.hostname) {
      return false;
    }
    
    // No fragments or query parameters typically
    if (parsed.hash || parsed.search) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
```

### 3. Generic Entity Filtering

#### `filterEntity(entityData: any, entityType: string): any`
**Purpose**: Generic filter function that routes to appropriate specific filters
**Current Gap**: No unified way to filter decoded entities based on their type.

**Proposed Implementation**:
```typescript
function filterEntity(data: any, type: string): any {
  switch (type) {
    case 'nprofile':
      return filterProfile(data);
    case 'nevent':
      return filterEvent(data);
    case 'naddr':
      return filterAddress(data);
    default:
      return data; // For simple entities like npub, nsec, note
  }
}
```

## Benefits

### 1. **Security**
- **XSS Prevention**: Ensures decoded entities don't contain unexpected fields that could be exploited
- **Data Validation**: Guarantees that decoded data matches expected schemas
- **Relay Safety**: Validates relay URLs to prevent malicious WebSocket connections

### 2. **Developer Experience**
- **Type Safety**: Provides predictable return types for decoded entities
- **Error Handling**: Clear error messages for invalid data
- **Consistency**: Standardized validation across all entity types

### 3. **Production Readiness**
- **Robust Parsing**: Handles malformed or malicious entities gracefully
- **Performance**: Efficient validation without expensive operations
- **Compatibility**: Works with existing decode functions seamlessly

## Usage Examples

### Current (Unsafe) Usage:
```typescript
import { decode } from 'snstr';

// Potential security risk - no validation
const decoded = decode('nprofile1...');
const pubkey = decoded.data.pubkey; // Could be undefined or malicious
```

### Proposed (Safe) Usage:
```typescript
import { decode, filterProfile } from 'snstr';

// Safe and validated
const decoded = decode('nprofile1...');
const safeProfile = filterProfile(decoded.data);
const pubkey = safeProfile.pubkey; // Guaranteed to be valid hex string
```

## Implementation Priority

1. **High Priority**: `filterProfile`, `filterEvent`, `isValidRelayUrl`
   - Most commonly used in client applications
   - Highest security impact

2. **Medium Priority**: `filterAddress`, `filterEntity`
   - Important for complete API coverage
   - Useful for advanced use cases

## Backward Compatibility

All proposed functions would be **additive** - they don't change existing functionality, only add new utility functions. Existing code using SNSTR would continue to work unchanged.

## Alternative Approaches Considered

1. **External validation library**: Could be done in a separate package, but having it in SNSTR provides better integration and ensures consistency.

2. **TypeScript-only solution**: Types alone don't provide runtime validation, which is essential for security.

3. **Application-level filtering**: Each application implementing their own filtering leads to inconsistency and potential security gaps.

## Conclusion

These security filtering functions would significantly improve the safety and developer experience of the SNSTR library. They address real security concerns we encountered while building a production Nostr client and would benefit the entire Nostr ecosystem.

The implementation would be straightforward, maintain backward compatibility, and provide immediate value to developers building secure Nostr applications.

---

**Contact**: Feel free to reach out if you need clarification on any of these proposals or would like to discuss implementation details. 