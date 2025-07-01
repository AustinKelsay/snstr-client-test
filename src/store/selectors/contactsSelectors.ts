/**
 * @fileoverview Selectors for contact-related state
 * Provides memoized selectors for efficient contact data access
 */

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store/types'

// Base selector
const selectContactsState = (state: RootState) => state.contacts

// Basic selectors
export const selectContacts = createSelector(
  [selectContactsState],
  (contacts) => contacts.contacts
)

export const selectFollowLists = createSelector(
  [selectContactsState],
  (contacts) => contacts.followLists
)

export const selectContactsLoading = createSelector(
  [selectContactsState],
  (contacts) => contacts.loading
)

export const selectContactsError = createSelector(
  [selectContactsState],
  (contacts) => contacts.error
)

export const selectContactsLastUpdated = createSelector(
  [selectContactsState],
  (contacts) => contacts.lastUpdated
)

// Computed selectors
export const selectFollowedPubkeys = createSelector(
  [selectContacts],
  (contacts) => contacts.map(contact => contact.pubkey)
)

export const selectContactsCount = createSelector(
  [selectContacts],
  (contacts) => contacts.length
)

export const selectIsFollowing = createSelector(
  [selectContacts, (state: RootState, pubkey: string) => pubkey],
  (contacts, pubkey) => contacts.some(contact => contact.pubkey === pubkey)
)

export const selectContactByPubkey = createSelector(
  [selectContacts, (state: RootState, pubkey: string) => pubkey],
  (contacts, pubkey) => contacts.find(contact => contact.pubkey === pubkey)
)

export const selectContactsWithPetnames = createSelector(
  [selectContacts],
  (contacts) => contacts.filter(contact => contact.petname)
)

export const selectContactsWithRelays = createSelector(
  [selectContacts],
  (contacts) => contacts.filter(contact => contact.relayUrl)
)

export const selectFollowListForUser = createSelector(
  [selectFollowLists, (state: RootState, userPubkey: string) => userPubkey],
  (followLists, userPubkey) => followLists[userPubkey] || []
)

export const selectIsUpdatingContacts = createSelector(
  [selectContactsLoading],
  (loading) => loading.updatingContacts
)

export const selectIsFetchingContacts = createSelector(
  [selectContactsLoading],
  (loading) => loading.fetchingContacts
)

// Helper selector for follow button states
export const selectFollowButtonState = createSelector(
  [
    selectIsFollowing,
    selectIsUpdatingContacts,
    (state: RootState, pubkey: string) => pubkey
  ],
  (isFollowing, isUpdating) => ({
    isFollowing,
    isLoading: isUpdating,
    buttonText: isFollowing ? 'Unfollow' : 'Follow',
    disabled: isUpdating
  })
)