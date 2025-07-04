/**
 * @fileoverview Selectors for posts state
 * Provides memoized selectors for efficient access to posts data
 * Includes selectors for timeline, following feed, and user posts
 */

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { Post, PublicKey, FeedType } from '@/types'

// Base selectors
const selectPostsState = (state: RootState) => state.posts

// Timeline selectors
export const selectTimelinePosts = createSelector(
  [selectPostsState],
  (posts) => posts.timeline
)

export const selectIsLoadingTimeline = createSelector(
  [selectPostsState],
  (posts) => posts.isLoadingTimeline
)

export const selectTimelineError = createSelector(
  [selectPostsState],
  (posts) => posts.timelineError
)

export const selectHasMoreTimeline = createSelector(
  [selectPostsState],
  (posts) => posts.hasMoreTimeline
)

// Following feed selectors
export const selectFollowingPosts = createSelector(
  [selectPostsState],
  (posts) => posts.following
)

export const selectIsLoadingFollowing = createSelector(
  [selectPostsState],
  (posts) => posts.isLoadingFollowing
)

export const selectFollowingError = createSelector(
  [selectPostsState],
  (posts) => posts.followingError
)

export const selectHasMoreFollowing = createSelector(
  [selectPostsState],
  (posts) => posts.hasMoreFollowing
)

// Feed selectors based on type
export const selectFeedPosts = createSelector(
  [selectPostsState, (state: RootState, feedType: FeedType) => feedType],
  (posts, feedType) => {
    switch (feedType) {
      case 'discover':
        return posts.timeline
      case 'following':
        return posts.following
      default:
        return []
    }
  }
)

export const selectIsFeedLoading = createSelector(
  [selectPostsState, (state: RootState, feedType: FeedType) => feedType],
  (posts, feedType) => {
    switch (feedType) {
      case 'discover':
        return posts.isLoadingTimeline
      case 'following':
        return posts.isLoadingFollowing
      default:
        return false
    }
  }
)

export const selectFeedError = createSelector(
  [selectPostsState, (state: RootState, feedType: FeedType) => feedType],
  (posts, feedType) => {
    switch (feedType) {
      case 'discover':
        return posts.timelineError
      case 'following':
        return posts.followingError
      default:
        return null
    }
  }
)

export const selectHasMoreFeed = createSelector(
  [selectPostsState, (state: RootState, feedType: FeedType) => feedType],
  (posts, feedType) => {
    switch (feedType) {
      case 'discover':
        return posts.hasMoreTimeline
      case 'following':
        return posts.hasMoreFollowing
      default:
        return false
    }
  }
)

// User posts selectors
export const selectUserPosts = createSelector(
  [selectPostsState, (state: RootState, pubkey: PublicKey) => pubkey],
  (posts, pubkey) => posts.userPosts[pubkey] || []
)

export const selectAllUserPosts = createSelector(
  [selectPostsState],
  (posts) => posts.userPosts
)

// Individual post selectors
export const selectPostById = createSelector(
  [selectPostsState, (state: RootState, postId: string) => postId],
  (posts, postId) => {
    // Search in timeline first
    let post = posts.timeline.find(p => p.id === postId)
    if (post) return post

    // Search in following feed
    post = posts.following.find(p => p.id === postId)
    if (post) return post

    // Search in all user posts
    for (const userPosts of Object.values(posts.userPosts)) {
      post = userPosts.find(p => p.id === postId)
      if (post) return post
    }

    return null
  }
)

// Utility selectors
export const selectLastUpdated = createSelector(
  [selectPostsState],
  (posts) => posts.lastUpdated
)

export const selectTotalTimelinePosts = createSelector(
  [selectTimelinePosts],
  (timeline) => timeline.length
)

export const selectTotalFollowingPosts = createSelector(
  [selectFollowingPosts],
  (following) => following.length
)

// Feed statistics
export const selectFeedStats = createSelector(
  [selectPostsState],
  (posts) => ({
    timelineCount: posts.timeline.length,
    followingCount: posts.following.length,
    userPostsCount: Object.keys(posts.userPosts).length,
    totalPosts: posts.timeline.length + posts.following.length + 
      Object.values(posts.userPosts).reduce((acc, userPosts) => acc + userPosts.length, 0),
    lastUpdated: posts.lastUpdated,
    isAnyLoading: posts.isLoadingTimeline || posts.isLoadingFollowing,
    hasErrors: !!(posts.timelineError || posts.followingError),
  })
)

// Recent posts (last 24 hours)
export const selectRecentPosts = createSelector(
  [selectTimelinePosts],
  (timeline) => {
    const oneDayAgo = Math.floor(Date.now() / 1000) - (24 * 60 * 60)
    return timeline.filter(post => post.created_at > oneDayAgo)
  }
)

// Posts with interactions (likes, reposts, etc.)
export const selectPopularPosts = createSelector(
  [selectTimelinePosts],
  (timeline) => {
    return [...timeline]
      .filter(post => (post.likes_count || 0) > 0 || (post.reposts_count || 0) > 0)
      .sort((a, b) => {
        const aScore = (a.likes_count || 0) + (a.reposts_count || 0) * 2 + (a.zaps_count || 0) * 3
        const bScore = (b.likes_count || 0) + (b.reposts_count || 0) * 2 + (b.zaps_count || 0) * 3
        return bScore - aScore
      })
      .slice(0, 10) // Top 10 popular posts
  }
)

// Posts by a specific user from timeline or following feed
export const selectPostsByAuthor = createSelector(
  [selectPostsState, (state: RootState, pubkey: PublicKey) => pubkey],
  (posts, pubkey) => {
    const allPosts: Post[] = [
      ...posts.timeline,
      ...posts.following,
      ...(posts.userPosts[pubkey] || [])
    ]
    
    // Remove duplicates and filter by author
    const uniquePostsMap = new Map<string, Post>()
    allPosts.forEach(post => {
      if (post.pubkey === pubkey) {
        uniquePostsMap.set(post.id, post)
      }
    })
    
    return Array.from(uniquePostsMap.values())
      .sort((a, b) => b.created_at - a.created_at)
  }
)

// Single post selectors
export const selectSinglePost = createSelector(
  [selectPostsState],
  (posts) => posts.singlePost
)

export const selectIsLoadingSinglePost = createSelector(
  [selectPostsState],
  (posts) => posts.isLoadingSinglePost
)

export const selectSinglePostError = createSelector(
  [selectPostsState],
  (posts) => posts.singlePostError
)

// Post replies selectors
export const selectPostReplies = createSelector(
  [selectPostsState, (state: RootState, postId: string) => postId],
  (posts, postId) => posts.postReplies[postId] || []
)

export const selectAllPostReplies = createSelector(
  [selectPostsState],
  (posts) => posts.postReplies
) 