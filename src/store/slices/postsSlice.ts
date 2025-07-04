/**
 * @fileoverview Posts slice for Redux store
 * Handles timeline posts, user posts, and post interactions
 * Manages timeline and following feed state with infinite scroll support
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { PostsState, Post, LoadPostsOptions, PublicKey } from '@/types'
import type { NostrEvent } from 'snstr'
import { nostrClient } from '@/features/nostr/nostrClient'
import { fetchBatchPostInteractions } from './interactionsSlice'

/**
 * Convert NostrEvent to Post interface with social media metadata
 */
function convertNostrEventToPost(event: NostrEvent): Post {
  // Extract mentions from p tags
  const mentions = event.tags
    .filter(tag => tag[0] === 'p' && tag.length > 1)
    .map(tag => tag[1])

  // Extract hashtags from t tags
  const hashtags = event.tags
    .filter(tag => tag[0] === 't' && tag.length > 1)
    .map(tag => tag[1])

  // Extract URLs from content (basic URL detection)
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = event.content.match(urlRegex) || []

  // Generate author info (will be enhanced with profile metadata later)
  const author_name = `user_${event.pubkey.slice(0, 8)}`

  return {
    ...event,
    author_name,
    replies_count: 0, // Will be calculated from replies
    likes_count: 0, // Will be calculated from reactions
    reposts_count: 0, // Will be calculated from reposts
    zaps_count: 0, // Will be calculated from zaps
    is_liked: false, // Will be determined by user interactions
    is_reposted: false, // Will be determined by user interactions
    is_bookmarked: false, // Will be determined by user bookmarks
    mentions,
    hashtags,
    urls,
  }
}

// Initial state
const initialState: PostsState = {
  timeline: [],
  following: [],
  userPosts: {},
  singlePost: null,
  postReplies: {},
  isLoadingTimeline: false,
  isLoadingFollowing: false,
  isLoadingSinglePost: false,
  timelineError: null,
  followingError: null,
  singlePostError: null,
  lastUpdated: null,
  hasMoreTimeline: true,
  hasMoreFollowing: true,
}

/**
 * Load timeline posts from discover feed
 * Fetches popular events from default relays using SNSTR
 */
export const loadTimelinePosts = createAsyncThunk(
  'posts/loadTimeline',
  async (options: LoadPostsOptions = {}) => {
    try {
      const { limit = 20, since, until } = options
      
      // Ensure client is connected to relays
      const connectedRelays = nostrClient.getConnectedRelays()
      if (connectedRelays.length === 0) {
        await nostrClient.connectToRelays()
      }

      // Create filter for timeline posts (kind 1 events)
      const filters = [{
        kinds: [1], // Text notes
        limit,
        since,
        until,
      }]

      // Fetch events from relays
      const events = await nostrClient.fetchEvents(filters, {
        maxWait: 5000,
        deduplicate: true,
      })
      
      // Convert events to posts
      const posts: Post[] = events.map(convertNostrEventToPost)
      
      // Sort by created_at descending (newest first)
      posts.sort((a, b) => b.created_at - a.created_at)
      
      return {
        posts,
        hasMore: posts.length === limit, // Has more if we got full limit
        timestamp: Date.now() / 1000,
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load timeline')
    }
  }
)

/**
 * Load timeline posts with interaction counts
 * Fetches posts and then batch fetches their interaction counts
 */
export const loadTimelineWithInteractions = createAsyncThunk(
  'posts/loadTimelineWithInteractions',
  async (options: LoadPostsOptions = {}, { dispatch }) => {
    try {
      // First load the timeline posts
      const timelineResult = await dispatch(loadTimelinePosts(options)).unwrap()
      
      // Extract post IDs for batch interaction fetching
      const postIds = timelineResult.posts.map(post => post.id)
      
      // Batch fetch interaction counts if we have posts
      if (postIds.length > 0) {
        // Don't await this - let it run in background to update counts
        dispatch(fetchBatchPostInteractions(postIds))
      }
      
      return timelineResult
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load timeline with interactions')
    }
  }
)

/**
 * Load following feed posts
 * Fetches events from users that the current user follows using SNSTR
 */
export const loadFollowingPosts = createAsyncThunk(
  'posts/loadFollowing',
  async (options: LoadPostsOptions = {}) => {
    try {
      const { limit = 20, since, until, authors = [] } = options
      
      if (authors.length === 0) {
        // Return empty if no follows
        return {
          posts: [],
          hasMore: false,
          timestamp: Date.now() / 1000,
        }
      }

      // Ensure client is connected to relays
      const connectedRelays = nostrClient.getConnectedRelays()
      if (connectedRelays.length === 0) {
        await nostrClient.connectToRelays()
      }

      // Create filter for following posts (kind 1 events from specific authors)
      const filters = [{
        kinds: [1], // Text notes
        authors, // Only from followed users
        limit,
        since,
        until,
      }]

      // Fetch events from relays
      const events = await nostrClient.fetchEvents(filters, {
        maxWait: 5000,
        deduplicate: true,
      })
      
      // Convert events to posts
      const posts: Post[] = events.map(convertNostrEventToPost)
      
      // Sort by created_at descending
      posts.sort((a, b) => b.created_at - a.created_at)
      
      return {
        posts,
        hasMore: posts.length === limit,
        timestamp: Date.now() / 1000,
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load following feed')
    }
  }
)

/**
 * Load following posts with interaction counts
 * Fetches posts from followed users and then batch fetches their interaction counts
 */
export const loadFollowingWithInteractions = createAsyncThunk(
  'posts/loadFollowingWithInteractions',
  async (options: LoadPostsOptions = {}, { dispatch }) => {
    try {
      // First load the following posts
      const followingResult = await dispatch(loadFollowingPosts(options)).unwrap()
      
      // Extract post IDs for batch interaction fetching
      const postIds = followingResult.posts.map(post => post.id)
      
      // Batch fetch interaction counts if we have posts
      if (postIds.length > 0) {
        // Don't await this - let it run in background to update counts
        dispatch(fetchBatchPostInteractions(postIds))
      }
      
      return followingResult
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load following feed with interactions')
    }
  }
)

/**
 * Load posts for a specific user
 * Fetches all posts from a specific author using SNSTR
 */
export const loadUserPosts = createAsyncThunk(
  'posts/loadUserPosts',
  async ({ pubkey, options = {} }: { pubkey: PublicKey; options?: LoadPostsOptions }) => {
    try {
      const { limit = 20, since, until } = options
      
      // Ensure client is connected to relays
      const connectedRelays = nostrClient.getConnectedRelays()
      if (connectedRelays.length === 0) {
        await nostrClient.connectToRelays()
      }

      // Create filter for user posts (kind 1 events from specific author)
      const filters = [{
        kinds: [1], // Text notes
        authors: [pubkey], // Only from this user
        limit,
        since,
        until,
      }]

      // Fetch events from relays
      const events = await nostrClient.fetchEvents(filters, {
        maxWait: 5000,
        deduplicate: true,
      })
      
      // Convert events to posts
      const posts: Post[] = events.map(convertNostrEventToPost)
      
      // Sort by created_at descending
      posts.sort((a, b) => b.created_at - a.created_at)
      
      return {
        pubkey,
        posts,
        timestamp: Date.now() / 1000,
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load user posts')
    }
  }
)

/**
 * Fetch a single post by ID
 */
export const fetchPost = createAsyncThunk(
  'posts/fetchPost',
  async (postId: string) => {
    try {
      // Ensure client is connected to relays
      const connectedRelays = nostrClient.getConnectedRelays()
      if (connectedRelays.length === 0) {
        await nostrClient.connectToRelays()
      }

      const filters = [{
        ids: [postId],
        kinds: [1], // Text notes only
        limit: 1
      }]

      // Fetch event from relays
      const events = await nostrClient.fetchEvents(filters, {
        maxWait: 3000,
        deduplicate: true,
      })
      
      if (events.length === 0) {
        throw new Error('Post not found')
      }

      // Convert event to post
      const post: Post = convertNostrEventToPost(events[0])
      
      return post
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch post')
    }
  }
)

/**
 * Fetch replies to a specific post
 */
export const fetchPostReplies = createAsyncThunk(
  'posts/fetchPostReplies',
  async (postId: string) => {
    try {
      // Ensure client is connected to relays
      const connectedRelays = nostrClient.getConnectedRelays()
      if (connectedRelays.length === 0) {
        await nostrClient.connectToRelays()
      }

      const filters = [{
        '#e': [postId], // Events that reference this post
        kinds: [1], // Text notes only
        limit: 100
      }]

      // Fetch reply events from relays
      const events = await nostrClient.fetchEvents(filters, {
        maxWait: 5000,
        deduplicate: true,
      })
      
      // Convert events to posts
      const replies: Post[] = events.map(convertNostrEventToPost)
      
      // Sort by created_at ascending (oldest first for threaded replies)
      replies.sort((a, b) => a.created_at - b.created_at)
      
      return {
        postId,
        replies,
        timestamp: Date.now() / 1000,
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch replies')
    }
  }
)

// Posts slice
export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Add a new post (for real-time updates or optimistic updates)
    addPost: (state, action: PayloadAction<Post>) => {
      const post = action.payload
      
      // Add to timeline if it's a kind-1 event
      if (post.kind === 1) {
        // Check if post already exists to avoid duplicates
        const existsInTimeline = state.timeline.some(p => p.id === post.id)
        if (!existsInTimeline) {
          state.timeline.unshift(post) // Add to beginning
          // Keep timeline manageable (max 100 posts)
          if (state.timeline.length > 100) {
            state.timeline.pop()
          }
        }
      }
      
      // Add to user posts
      if (!state.userPosts[post.pubkey]) {
        state.userPosts[post.pubkey] = []
      }
      const existsInUserPosts = state.userPosts[post.pubkey].some(p => p.id === post.id)
      if (!existsInUserPosts) {
        state.userPosts[post.pubkey].unshift(post)
        // Keep user posts manageable (max 50 posts per user)
        if (state.userPosts[post.pubkey].length > 50) {
          state.userPosts[post.pubkey].pop()
        }
      }
    },

    // Update an existing post (for interactions like likes, zaps)
    updatePost: (state, action: PayloadAction<Partial<Post> & { id: string }>) => {
      const { id, ...updates } = action.payload
      
      // Update in timeline
      const timelineIndex = state.timeline.findIndex(p => p.id === id)
      if (timelineIndex !== -1) {
        state.timeline[timelineIndex] = { ...state.timeline[timelineIndex], ...updates }
      }
      
      // Update in following feed
      const followingIndex = state.following.findIndex(p => p.id === id)
      if (followingIndex !== -1) {
        state.following[followingIndex] = { ...state.following[followingIndex], ...updates }
      }
      
      // Update in user posts
      Object.keys(state.userPosts).forEach(pubkey => {
        const userPostIndex = state.userPosts[pubkey].findIndex(p => p.id === id)
        if (userPostIndex !== -1) {
          state.userPosts[pubkey][userPostIndex] = {
            ...state.userPosts[pubkey][userPostIndex],
            ...updates
          }
        }
      })
    },

    // Update multiple posts with interaction counts
    updatePostsWithInteractions: (state, action: PayloadAction<Record<string, { likes_count: number; reposts_count: number; replies_count: number; is_liked: boolean; is_reposted: boolean }>>) => {
      const interactionUpdates = action.payload
      
      // Update timeline posts
      state.timeline.forEach((post, index) => {
        const update = interactionUpdates[post.id]
        if (update) {
          state.timeline[index] = { ...post, ...update }
        }
      })
      
      // Update following feed posts
      state.following.forEach((post, index) => {
        const update = interactionUpdates[post.id]
        if (update) {
          state.following[index] = { ...post, ...update }
        }
      })
      
      // Update user posts
      Object.keys(state.userPosts).forEach(pubkey => {
        state.userPosts[pubkey].forEach((post, index) => {
          const update = interactionUpdates[post.id]
          if (update) {
            state.userPosts[pubkey][index] = { ...post, ...update }
          }
        })
      })
    },

    // Remove a post (for deletions)
    removePost: (state, action: PayloadAction<string>) => {
      const id = action.payload
      
      // Remove from timeline
      state.timeline = state.timeline.filter(p => p.id !== id)
      
      // Remove from following feed
      state.following = state.following.filter(p => p.id !== id)
      
      // Remove from user posts
      Object.keys(state.userPosts).forEach(pubkey => {
        state.userPosts[pubkey] = state.userPosts[pubkey].filter(p => p.id !== id)
      })
    },

    // Clear all posts (for logout or refresh)
    clearPosts: state => {
      state.timeline = []
      state.following = []
      state.userPosts = {}
      state.timelineError = null
      state.followingError = null
      state.lastUpdated = null
      state.hasMoreTimeline = true
      state.hasMoreFollowing = true
    },

    // Clear errors
    clearTimelineError: state => {
      state.timelineError = null
    },
    clearFollowingError: state => {
      state.followingError = null
    },
  },
  extraReducers: (builder) => {
    // Timeline posts loading
    builder
      .addCase(loadTimelinePosts.pending, (state) => {
        state.isLoadingTimeline = true
        state.timelineError = null
      })
      .addCase(loadTimelinePosts.fulfilled, (state, action) => {
        state.isLoadingTimeline = false
        const { posts, hasMore, timestamp } = action.payload
        
        // If this is a refresh (no existing posts), replace timeline
        if (state.timeline.length === 0) {
          state.timeline = posts
        } else {
          // Otherwise, append new posts
          const existingIds = new Set(state.timeline.map(p => p.id))
          const newPosts = posts.filter(p => !existingIds.has(p.id))
          state.timeline.push(...newPosts)
        }
        
        state.hasMoreTimeline = hasMore
        state.lastUpdated = timestamp
      })
      .addCase(loadTimelinePosts.rejected, (state, action) => {
        state.isLoadingTimeline = false
        state.timelineError = action.error.message || 'Failed to load timeline'
      })

    // Following posts loading
    builder
      .addCase(loadFollowingPosts.pending, (state) => {
        state.isLoadingFollowing = true
        state.followingError = null
      })
      .addCase(loadFollowingPosts.fulfilled, (state, action) => {
        state.isLoadingFollowing = false
        const { posts, hasMore, timestamp } = action.payload
        
        // If this is a refresh, replace following feed
        if (state.following.length === 0) {
          state.following = posts
        } else {
          // Otherwise, append new posts
          const existingIds = new Set(state.following.map(p => p.id))
          const newPosts = posts.filter(p => !existingIds.has(p.id))
          state.following.push(...newPosts)
        }
        
        state.hasMoreFollowing = hasMore
        state.lastUpdated = timestamp
      })
      .addCase(loadFollowingPosts.rejected, (state, action) => {
        state.isLoadingFollowing = false
        state.followingError = action.error.message || 'Failed to load following feed'
      })

    // User posts loading
    builder
      .addCase(loadUserPosts.pending, () => {
        // User posts loading is handled per-user, so no global loading state
      })
      .addCase(loadUserPosts.fulfilled, (state, action) => {
        const { pubkey, posts } = action.payload
        state.userPosts[pubkey] = posts
      })
      .addCase(loadUserPosts.rejected, () => {
        // User posts errors are handled per-component through action.error
        // Error logging should be handled by components, not reducers
      })

    // Single post loading
    builder
      .addCase(fetchPost.pending, (state) => {
        state.isLoadingSinglePost = true
        state.singlePostError = null
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.isLoadingSinglePost = false
        state.singlePost = action.payload
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.isLoadingSinglePost = false
        state.singlePostError = action.error.message || 'Failed to fetch post'
      })

    // Post replies loading
    builder
      .addCase(fetchPostReplies.pending, () => {
        // Replies loading is handled per-post
      })
      .addCase(fetchPostReplies.fulfilled, (state, action) => {
        const { postId, replies } = action.payload
        state.postReplies[postId] = replies
      })
      .addCase(fetchPostReplies.rejected, () => {
        // Post reply errors are handled per-component through action.error
        // Error logging should be handled by components, not reducers
      })

    // Handle batch interaction loading
    builder
      .addCase(fetchBatchPostInteractions.fulfilled, (state, action) => {
        const interactionsList = action.payload
        const updates: Record<string, { likes_count: number; reposts_count: number; replies_count: number; is_liked: boolean; is_reposted: boolean }> = {}
        
        interactionsList.forEach(interactions => {
          updates[interactions.eventId] = {
            likes_count: interactions.likes,
            reposts_count: interactions.reposts,
            replies_count: interactions.replies,
            is_liked: interactions.userInteractions.liked,
            is_reposted: interactions.userInteractions.reposted,
          }
        })
        
        // Use the updatePostsWithInteractions reducer to update all relevant posts
        postsSlice.caseReducers.updatePostsWithInteractions(state, {
          type: 'posts/updatePostsWithInteractions',
          payload: updates
        })
      })
  },
})

// Export actions
export const {
  addPost,
  updatePost,
  updatePostsWithInteractions,
  removePost,
  clearPosts,
  clearTimelineError,
  clearFollowingError,
} = postsSlice.actions

// Export reducer as default
export default postsSlice.reducer 