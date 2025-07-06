/**
 * @fileoverview Selectors for interactions-related state
 * Provides memoized selectors for efficient interaction data access
 */

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

// Base selector
const selectInteractionsState = (state: RootState) => state.interactions

// Basic selectors
export const selectPostInteractions = createSelector(
  [selectInteractionsState],
  (interactions) => interactions.postInteractions
)

export const selectInteractionsLoading = createSelector(
  [selectInteractionsState],
  (interactions) => interactions.loading
)

export const selectOptimisticUpdates = createSelector(
  [selectInteractionsState],
  (interactions) => interactions.optimisticUpdates
)

export const selectInteractionsError = createSelector(
  [selectInteractionsState],
  (interactions) => interactions.error
)

// Post-specific selectors
export const selectPostInteractionData = createSelector(
  [
    selectPostInteractions,
    selectOptimisticUpdates,
    (state: RootState, eventId: string) => eventId
  ],
  (postInteractions, optimisticUpdates, eventId) => {
    const baseData = postInteractions[eventId]
    const optimisticData = optimisticUpdates[eventId]
    
    // Return optimistic data if available, otherwise base data
    if (optimisticData) {
      return {
        ...baseData,
        ...optimisticData,
        eventId,
      }
    }
    
    return baseData || {
      eventId,
      likes: 0,
      reposts: 0,
      zaps: { count: 0, total: 0 },
      userInteractions: {
        liked: false,
        reposted: false,
        zapped: false,
      }
    }
  }
)

export const selectIsLiking = createSelector(
  [selectInteractionsLoading, (state: RootState, eventId: string) => eventId],
  (loading, eventId) => loading.liking[eventId] || false
)

export const selectIsReposting = createSelector(
  [selectInteractionsLoading, (state: RootState, eventId: string) => eventId],
  (loading, eventId) => loading.reposting[eventId] || false
)

export const selectIsZapping = createSelector(
  [selectInteractionsLoading, (state: RootState, eventId: string) => eventId],
  (loading, eventId) => loading.zapping[eventId] || false
)

// Combined selector for interaction button states
export const selectInteractionButtonStates = createSelector(
  [
    selectPostInteractionData,
    selectIsLiking,
    selectIsReposting,
    selectIsZapping,
    (state: RootState, eventId: string) => eventId
  ],
  (interactionData, isLiking, isReposting, isZapping) => ({
    like: {
      count: interactionData.likes,
      isActive: interactionData.userInteractions.liked,
      isLoading: isLiking,
      disabled: isLiking,
    },
    repost: {
      count: interactionData.reposts,
      isActive: interactionData.userInteractions.reposted,
      isLoading: isReposting,
      disabled: isReposting,
    },
    zap: {
      count: interactionData.zaps.count,
      total: interactionData.zaps.total,
      isActive: interactionData.userInteractions.zapped,
      isLoading: isZapping,
      disabled: isZapping,
    },
  })
)

// Utility selectors
export const selectHasUserLiked = createSelector(
  [selectPostInteractionData, (state: RootState, eventId: string) => eventId],
  (interactionData) => interactionData.userInteractions.liked
)

export const selectHasUserReposted = createSelector(
  [selectPostInteractionData, (state: RootState, eventId: string) => eventId],
  (interactionData) => interactionData.userInteractions.reposted
)

export const selectLikeCount = createSelector(
  [selectPostInteractionData, (state: RootState, eventId: string) => eventId],
  (interactionData) => interactionData.likes
)

export const selectRepostCount = createSelector(
  [selectPostInteractionData, (state: RootState, eventId: string) => eventId],
  (interactionData) => interactionData.reposts
)

export const selectZapCount = createSelector(
  [selectPostInteractionData, (state: RootState, eventId: string) => eventId],
  (interactionData) => interactionData.zaps.count
)

export const selectZapTotal = createSelector(
  [selectPostInteractionData, (state: RootState, eventId: string) => eventId],
  (interactionData) => interactionData.zaps.total
)

// Selector for total interaction count
export const selectTotalInteractions = createSelector(
  [selectPostInteractionData, (state: RootState, eventId: string) => eventId],
  (interactionData) => 
    interactionData.likes + 
    interactionData.reposts + 
    interactionData.zaps.count
)