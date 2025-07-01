/**
 * @fileoverview Redux slice for managing post interactions (likes, reposts, zaps)
 * Handles NIP-25 reactions, reposts, and other social interactions
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { nostrClient } from '@/features/nostr/nostrClient'
import type { NostrEvent } from '@/types'

// Interaction types
export type InteractionType = 'like' | 'dislike' | 'repost' | 'zap'

export interface Interaction {
  /** Event ID being interacted with */
  eventId: string
  /** Type of interaction */
  type: InteractionType
  /** User's pubkey who made the interaction */
  pubkey: string
  /** Timestamp of interaction */
  timestamp: number
  /** Optional content (for reposts or comments) */
  content?: string
  /** Zap amount in sats (for zaps) */
  amount?: number
}

export interface PostInteractions {
  /** Event ID */
  eventId: string
  /** Like count */
  likes: number
  /** Repost count */
  reposts: number
  /** Zap count and total amount */
  zaps: {
    count: number
    total: number
  }
  /** User's interactions with this post */
  userInteractions: {
    liked: boolean
    reposted: boolean
    zapped: boolean
  }
}

export interface InteractionsState {
  /** Post interactions by event ID */
  postInteractions: Record<string, PostInteractions>
  /** Loading states for interactions */
  loading: {
    liking: Record<string, boolean>
    reposting: Record<string, boolean>
    zapping: Record<string, boolean>
  }
  /** Optimistic updates */
  optimisticUpdates: Record<string, Partial<PostInteractions>>
  /** Error states */
  error: string | null
}

// Initial state
const initialState: InteractionsState = {
  postInteractions: {},
  loading: {
    liking: {},
    reposting: {},
    zapping: {},
  },
  optimisticUpdates: {},
  error: null,
}

/**
 * Like a post using kind 7 reaction event
 */
export const likePost = createAsyncThunk(
  'interactions/likePost',
  async (
    { eventId, eventPubkey }: { eventId: string; eventPubkey: string },
    { rejectWithValue }
  ) => {
    try {
      // Create kind 7 reaction event using SNSTR's generic tools
      const reactionEvent: Omit<NostrEvent, 'id' | 'pubkey' | 'sig'> = {
        kind: 7, // Reaction kind (standard Nostr)
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['e', eventId], // Event being reacted to
          ['p', eventPubkey], // Author of the event being reacted to
        ],
        content: '+', // Positive reaction (like)
      }

      // Sign the event using NIP-07
      if (typeof window !== 'undefined' && window.nostr) {
        const signedEvent = await window.nostr.signEvent(reactionEvent)
        await nostrClient.publishEvent(signedEvent as NostrEvent)
        
        return { eventId, type: 'like' as const, success: true }
      } else {
        throw new Error('NIP-07 extension not available')
      }
    } catch (error) {
      console.error('Failed to like post:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to like post')
    }
  }
)

/**
 * Unlike a post by deleting the reaction (kind 5 deletion event)
 */
export const unlikePost = createAsyncThunk(
  'interactions/unlikePost',
  async (
    { eventId, reactionEventId }: { eventId: string; reactionEventId: string },
    { rejectWithValue }
  ) => {
    try {
      // Create kind 5 deletion event using SNSTR's generic tools
      const deletionEvent: Omit<NostrEvent, 'id' | 'pubkey' | 'sig'> = {
        kind: 5, // Deletion kind (standard Nostr)
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['e', reactionEventId], // Event to delete (the reaction event)
        ],
        content: 'Removing reaction',
      }

      // Sign the event using NIP-07
      if (typeof window !== 'undefined' && window.nostr) {
        const signedEvent = await window.nostr.signEvent(deletionEvent)
        await nostrClient.publishEvent(signedEvent as NostrEvent)
        
        return { eventId, type: 'unlike' as const, success: true }
      } else {
        throw new Error('NIP-07 extension not available')
      }
    } catch (error) {
      console.error('Failed to unlike post:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to unlike post')
    }
  }
)

/**
 * Repost an event using kind 6 (standard Nostr repost)
 */
export const repostEvent = createAsyncThunk(
  'interactions/repostEvent',
  async (
    { eventId, eventPubkey, originalEvent }: { 
      eventId: string
      eventPubkey: string
      originalEvent: NostrEvent
    },
    { rejectWithValue }
  ) => {
    try {
      // Create kind 6 repost event using SNSTR's generic tools
      const repostEvent: Omit<NostrEvent, 'id' | 'pubkey' | 'sig'> = {
        kind: 6, // Repost kind (standard Nostr)
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['e', eventId], // Event being reposted
          ['p', eventPubkey], // Author of original event
        ],
        content: JSON.stringify(originalEvent), // Include original event JSON
      }

      // Sign the event using NIP-07
      if (typeof window !== 'undefined' && window.nostr) {
        const signedEvent = await window.nostr.signEvent(repostEvent)
        await nostrClient.publishEvent(signedEvent as NostrEvent)
        
        return { eventId, type: 'repost' as const, success: true }
      } else {
        throw new Error('NIP-07 extension not available')
      }
    } catch (error) {
      console.error('Failed to repost:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to repost')
    }
  }
)

/**
 * Fetch interaction counts for a post
 */
export const fetchPostInteractions = createAsyncThunk(
  'interactions/fetchPostInteractions',
  async (eventId: string, { rejectWithValue }) => {
    try {
      // Fetch reactions (kind 7) for this event
      const reactionEvents = await nostrClient.fetchEvents([
        {
          kinds: [7], // Reactions
          '#e': [eventId],
          limit: 1000
        }
      ], { maxWait: 3000 })

      // Fetch reposts (kind 6) for this event
      const repostEvents = await nostrClient.fetchEvents([
        {
          kinds: [6], // Reposts
          '#e': [eventId],
          limit: 1000
        }
      ], { maxWait: 3000 })

      // Count likes (reactions with '+' content)
      const likes = reactionEvents.filter(event => 
        event.content === '+' || event.content === '👍' || event.content === '❤️'
      ).length

      // Count reposts
      const reposts = repostEvents.length

      // TODO: Fetch zaps when implementing NIP-57
      const zaps = { count: 0, total: 0 }

      // Check if current user has interacted
      const currentUserPubkey = await getCurrentUserPubkey()
      const userInteractions = {
        liked: currentUserPubkey ? reactionEvents.some(event => 
          event.pubkey === currentUserPubkey && 
          (event.content === '+' || event.content === '👍' || event.content === '❤️')
        ) : false,
        reposted: currentUserPubkey ? repostEvents.some(event => 
          event.pubkey === currentUserPubkey
        ) : false,
        zapped: false, // TODO: Implement zap checking
      }

      return {
        eventId,
        likes,
        reposts,
        zaps,
        userInteractions,
      }
    } catch (error) {
      console.error('Failed to fetch post interactions:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch interactions')
    }
  }
)

// Helper function to get current user pubkey
async function getCurrentUserPubkey(): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && window.nostr) {
      return await window.nostr.getPublicKey()
    }
    return null
  } catch (error) {
    console.error('Failed to get current user pubkey:', error)
    return null
  }
}

// Interactions slice
export const interactionsSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    // Optimistic update for like
    optimisticLike: (state, action: PayloadAction<string>) => {
      const eventId = action.payload
      if (!state.optimisticUpdates[eventId]) {
        state.optimisticUpdates[eventId] = {}
      }
      
      const current = state.postInteractions[eventId]
      if (current) {
        state.optimisticUpdates[eventId] = {
          ...current,
          likes: current.userInteractions.liked ? current.likes - 1 : current.likes + 1,
          userInteractions: {
            ...current.userInteractions,
            liked: !current.userInteractions.liked,
          }
        }
      } else {
        state.optimisticUpdates[eventId] = {
          eventId,
          likes: 1,
          reposts: 0,
          zaps: { count: 0, total: 0 },
          userInteractions: {
            liked: true,
            reposted: false,
            zapped: false,
          }
        }
      }
    },

    // Optimistic update for repost
    optimisticRepost: (state, action: PayloadAction<string>) => {
      const eventId = action.payload
      if (!state.optimisticUpdates[eventId]) {
        state.optimisticUpdates[eventId] = {}
      }
      
      const current = state.postInteractions[eventId]
      if (current) {
        state.optimisticUpdates[eventId] = {
          ...current,
          reposts: current.userInteractions.reposted ? current.reposts - 1 : current.reposts + 1,
          userInteractions: {
            ...current.userInteractions,
            reposted: !current.userInteractions.reposted,
          }
        }
      } else {
        state.optimisticUpdates[eventId] = {
          eventId,
          likes: 0,
          reposts: 1,
          zaps: { count: 0, total: 0 },
          userInteractions: {
            liked: false,
            reposted: true,
            zapped: false,
          }
        }
      }
    },

    // Clear optimistic updates
    clearOptimisticUpdates: (state, action: PayloadAction<string>) => {
      delete state.optimisticUpdates[action.payload]
    },

    // Clear all optimistic updates
    clearAllOptimisticUpdates: (state) => {
      state.optimisticUpdates = {}
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Like post
      .addCase(likePost.pending, (state, action) => {
        const eventId = action.meta.arg.eventId
        state.loading.liking[eventId] = true
        state.error = null
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const { eventId } = action.payload
        state.loading.liking[eventId] = false
        // Clear optimistic update - the real data will come from fetchPostInteractions
        delete state.optimisticUpdates[eventId]
      })
      .addCase(likePost.rejected, (state, action) => {
        const eventId = action.meta.arg.eventId
        state.loading.liking[eventId] = false
        state.error = action.payload as string
        // Revert optimistic update
        delete state.optimisticUpdates[eventId]
      })

      // Unlike post
      .addCase(unlikePost.pending, (state, action) => {
        const eventId = action.meta.arg.eventId
        state.loading.liking[eventId] = true
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        const { eventId } = action.payload
        state.loading.liking[eventId] = false
        delete state.optimisticUpdates[eventId]
      })
      .addCase(unlikePost.rejected, (state, action) => {
        const eventId = action.meta.arg.eventId
        state.loading.liking[eventId] = false
        state.error = action.payload as string
        delete state.optimisticUpdates[eventId]
      })

      // Repost event
      .addCase(repostEvent.pending, (state, action) => {
        const eventId = action.meta.arg.eventId
        state.loading.reposting[eventId] = true
        state.error = null
      })
      .addCase(repostEvent.fulfilled, (state, action) => {
        const { eventId } = action.payload
        state.loading.reposting[eventId] = false
        delete state.optimisticUpdates[eventId]
      })
      .addCase(repostEvent.rejected, (state, action) => {
        const eventId = action.meta.arg.eventId
        state.loading.reposting[eventId] = false
        state.error = action.payload as string
        delete state.optimisticUpdates[eventId]
      })

      // Fetch post interactions
      .addCase(fetchPostInteractions.fulfilled, (state, action) => {
        const interactions = action.payload
        state.postInteractions[interactions.eventId] = interactions
        // Clear optimistic updates for this post
        delete state.optimisticUpdates[interactions.eventId]
      })
  },
})

export const { 
  optimisticLike, 
  optimisticRepost, 
  clearOptimisticUpdates, 
  clearAllOptimisticUpdates,
  clearError 
} = interactionsSlice.actions

export default interactionsSlice.reducer