/**
 * @fileoverview Redux slice for managing NIP-02 contact lists and user follows
 * Handles contact list fetching, following/unfollowing, and contact management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { nostrClient } from '@/features/nostr/nostrClient'
import type { NostrEvent, Filter } from 'snstr'

// Contact interface based on NIP-02 spec
export interface Contact {
  /** 64-character hex pubkey */
  pubkey: string
  /** Optional relay URL for the contact */
  relayUrl?: string
  /** Optional petname/display name */
  petname?: string
}

// Contact list state interface
export interface ContactsState {
  /** Current user's contact list */
  contacts: Contact[]
  /** Follow lists for other users (pubkey -> contacts) */
  followLists: Record<string, Contact[]>
  /** Loading states */
  loading: {
    fetchingContacts: boolean
    updatingContacts: boolean
  }
  /** Error states */
  error: string | null
  /** Last updated timestamp */
  lastUpdated: number | null
}

// Initial state
const initialState: ContactsState = {
  contacts: [],
  followLists: {},
  loading: {
    fetchingContacts: false,
    updatingContacts: false,
  },
  error: null,
  lastUpdated: null,
}

/**
 * Fetch current user's contact list from relays
 */
export const fetchUserContacts = createAsyncThunk(
  'contacts/fetchUserContacts',
  async (userPubkey: string, { rejectWithValue }) => {
    try {
      // Fetch kind 3 contact list events for the user
      const filters: Filter[] = [
        {
          kinds: [3],
          authors: [userPubkey],
          limit: 1
        }
      ]

      const events = await nostrClient.fetchEvents(filters, { maxWait: 5000 })
      
      if (events.length === 0) {
        return []
      }

      // Get the most recent contact list event
      const latestEvent = events.sort((a, b) => b.created_at - a.created_at)[0]
      
      // Parse contacts from the event
      const contacts = parseContactsFromEvent(latestEvent)
      
      return contacts
    } catch (error) {
      console.error('Failed to fetch user contacts:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch contacts')
    }
  }
)

/**
 * Fetch contact list for a specific user
 */
export const fetchContactsForUser = createAsyncThunk(
  'contacts/fetchContactsForUser',
  async (userPubkey: string, { rejectWithValue }) => {
    try {
      const filters: Filter[] = [
        {
          kinds: [3],
          authors: [userPubkey],
          limit: 1
        }
      ]

      const events = await nostrClient.fetchEvents(filters, { maxWait: 3000 })
      
      if (events.length === 0) {
        return { userPubkey, contacts: [] }
      }

      const latestEvent = events.sort((a, b) => b.created_at - a.created_at)[0]
      const contacts = parseContactsFromEvent(latestEvent)
      
      return { userPubkey, contacts }
    } catch (error) {
      console.error(`Failed to fetch contacts for user ${userPubkey}:`, error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user contacts')
    }
  }
)

/**
 * Follow a user by adding them to contact list
 */
export const followUser = createAsyncThunk(
  'contacts/followUser',
  async (
    { pubkey, relayUrl, petname }: { pubkey: string; relayUrl?: string; petname?: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { contacts: ContactsState }
      const currentContacts = state.contacts.contacts

      // Check if already following
      if (currentContacts.some(contact => contact.pubkey === pubkey)) {
        throw new Error('Already following this user')
      }

      // Create new contact
      const newContact: Contact = {
        pubkey,
        relayUrl,
        petname
      }

      // Add to existing contacts
      const updatedContacts = [...currentContacts, newContact]

      // Create and publish contact list event
      const contactListEvent = await createContactListEvent(updatedContacts)
      await nostrClient.publishEvent(contactListEvent)

      return newContact
    } catch (error) {
      console.error('Failed to follow user:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to follow user')
    }
  }
)

/**
 * Unfollow a user by removing them from contact list
 */
export const unfollowUser = createAsyncThunk(
  'contacts/unfollowUser',
  async (pubkey: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { contacts: ContactsState }
      const currentContacts = state.contacts.contacts

      // Filter out the unfollowed user
      const updatedContacts = currentContacts.filter(contact => contact.pubkey !== pubkey)

      // Create and publish updated contact list event
      const contactListEvent = await createContactListEvent(updatedContacts)
      await nostrClient.publishEvent(contactListEvent)

      return pubkey
    } catch (error) {
      console.error('Failed to unfollow user:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to unfollow user')
    }
  }
)

/**
 * Update contact information (petname, relay)
 */
export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async (
    { pubkey, updates }: { pubkey: string; updates: Partial<Pick<Contact, 'relayUrl' | 'petname'>> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { contacts: ContactsState }
      const currentContacts = state.contacts.contacts

      // Update the contact
      const updatedContacts = currentContacts.map(contact =>
        contact.pubkey === pubkey
          ? { ...contact, ...updates }
          : contact
      )

      // Create and publish updated contact list event
      const contactListEvent = await createContactListEvent(updatedContacts)
      await nostrClient.publishEvent(contactListEvent)

      return { pubkey, updates }
    } catch (error) {
      console.error('Failed to update contact:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update contact')
    }
  }
)

// Helper function to parse contacts from a kind 3 event
function parseContactsFromEvent(event: NostrEvent): Contact[] {
  try {
    const contacts: Contact[] = []

    // Parse p tags for contacts
    for (const tag of event.tags) {
      if (tag[0] === 'p' && tag[1]) {
        // Validate pubkey format
        if (!/^[0-9a-fA-F]{64}$/.test(tag[1])) {
          console.warn(`Invalid pubkey format: ${tag[1]}`)
          continue
        }

        const contact: Contact = {
          pubkey: tag[1],
          relayUrl: tag[2] && (tag[2].startsWith('ws://') || tag[2].startsWith('wss://')) ? tag[2] : undefined,
          petname: tag[3] || undefined
        }

        // Check for duplicates
        if (!contacts.some(c => c.pubkey === contact.pubkey)) {
          contacts.push(contact)
        }
      }
    }

    return contacts
  } catch (error) {
    console.error('Failed to parse contacts from event:', error)
    return []
  }
}

// Helper function to create a contact list event
async function createContactListEvent(contacts: Contact[]): Promise<NostrEvent> {
  try {
    // Create p tags for each contact
    const tags: string[][] = contacts.map(contact => {
      const tag = ['p', contact.pubkey]
      if (contact.relayUrl) tag.push(contact.relayUrl)
      if (contact.petname) {
        if (!contact.relayUrl) tag.push('') // Empty relay URL if petname but no relay
        tag.push(contact.petname)
      }
      return tag
    })

    // Create the event
    const event: Omit<NostrEvent, 'id' | 'pubkey' | 'sig'> = {
      kind: 3,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content: '', // Usually empty for contact lists
    }

    // Sign the event using NIP-07
    if (typeof window !== 'undefined' && window.nostr) {
      const signedEvent = await window.nostr.signEvent(event)
      return signedEvent as NostrEvent
    } else {
      throw new Error('NIP-07 extension not available')
    }
  } catch (error) {
    console.error('Failed to create contact list event:', error)
    throw error
  }
}

// Contacts slice
export const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearContacts: (state) => {
      state.contacts = []
      state.followLists = {}
      state.lastUpdated = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user contacts
      .addCase(fetchUserContacts.pending, (state) => {
        state.loading.fetchingContacts = true
        state.error = null
      })
      .addCase(fetchUserContacts.fulfilled, (state, action) => {
        state.loading.fetchingContacts = false
        state.contacts = action.payload
        state.lastUpdated = Date.now()
      })
      .addCase(fetchUserContacts.rejected, (state, action) => {
        state.loading.fetchingContacts = false
        state.error = action.payload as string
      })

      // Fetch contacts for user
      .addCase(fetchContactsForUser.fulfilled, (state, action) => {
        const { userPubkey, contacts } = action.payload
        state.followLists[userPubkey] = contacts
      })

      // Follow user
      .addCase(followUser.pending, (state) => {
        state.loading.updatingContacts = true
        state.error = null
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.loading.updatingContacts = false
        state.contacts.push(action.payload)
        state.lastUpdated = Date.now()
      })
      .addCase(followUser.rejected, (state, action) => {
        state.loading.updatingContacts = false
        state.error = action.payload as string
      })

      // Unfollow user
      .addCase(unfollowUser.pending, (state) => {
        state.loading.updatingContacts = true
        state.error = null
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.loading.updatingContacts = false
        state.contacts = state.contacts.filter(contact => contact.pubkey !== action.payload)
        state.lastUpdated = Date.now()
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.loading.updatingContacts = false
        state.error = action.payload as string
      })

      // Update contact
      .addCase(updateContact.pending, (state) => {
        state.loading.updatingContacts = true
        state.error = null
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.loading.updatingContacts = false
        const { pubkey, updates } = action.payload
        const contactIndex = state.contacts.findIndex(contact => contact.pubkey === pubkey)
        if (contactIndex !== -1) {
          state.contacts[contactIndex] = { ...state.contacts[contactIndex], ...updates }
        }
        state.lastUpdated = Date.now()
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading.updatingContacts = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearContacts } = contactsSlice.actions
export default contactsSlice.reducer