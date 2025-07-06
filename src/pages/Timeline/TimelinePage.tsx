/**
 * @fileoverview Timeline page component for displaying user timeline
 * Shows chronological posts with feed switching between Discover and Following
 * Features infinite scroll, real-time updates, and post interactions
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { loadTimelineWithInteractions, loadFollowingWithInteractions } from '@/store/slices/postsSlice'
import { fetchUserContacts } from '@/store/slices/contactsSlice'
import { likePost, repostEvent, optimisticLike, optimisticRepost } from '@/store/slices/interactionsSlice'
import { selectFeedPosts, selectIsFeedLoading, selectFeedError, selectHasMoreFeed } from '@/store/selectors'
import { selectFollowedPubkeys, selectIsFetchingContacts } from '@/store/selectors/contactsSelectors'
import { PostList, PostComposer, PostListSkeleton } from '@/components/post'
import { useTimelineProfiles } from '@/hooks/useTimelineProfiles'
import { createProfileNavigator } from '@/utils/navigation'
import type { FeedType, Post } from '@/types'

export interface TimelinePageProps {
  className?: string
}

/**
 * Timeline page component displays the main feed of posts
 * Features feed switching, infinite scroll, real-time updates, and post interactions
 */
export function TimelinePage({ className }: TimelinePageProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [feedType, setFeedType] = useState<FeedType>('discover')

  // Selectors
  const posts = useAppSelector((state) => selectFeedPosts(state, feedType))
  const isLoading = useAppSelector((state) => selectIsFeedLoading(state, feedType))
  const error = useAppSelector((state) => selectFeedError(state, feedType))
  const hasMore = useAppSelector((state) => selectHasMoreFeed(state, feedType))
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const followedPubkeys = useAppSelector(selectFollowedPubkeys)
  const isFetchingContacts = useAppSelector(selectIsFetchingContacts)

  // Automatically load profiles for all posts in timeline with higher limits
  useTimelineProfiles(posts, {
    autoFetch: true,
    subscribe: true,
    maxProfiles: 200 // Increased from 50 to handle larger timelines
  })

  // Fetch user contacts when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.pubkey) {
      dispatch(fetchUserContacts(user.pubkey))
    }
  }, [dispatch, isAuthenticated, user?.pubkey])

  // Load initial posts
  useEffect(() => {
    if (feedType === 'discover') {
      dispatch(loadTimelineWithInteractions({ limit: 20 }))
    } else if (feedType === 'following' && isAuthenticated) {
      // Use actual followed pubkeys instead of empty array
      if (followedPubkeys.length > 0) {
        dispatch(loadFollowingWithInteractions({ limit: 20, authors: followedPubkeys }))
      }
    }
  }, [dispatch, feedType, isAuthenticated, followedPubkeys])

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (feedType === 'discover') {
      const lastPost = posts[posts.length - 1]
      dispatch(loadTimelineWithInteractions({ 
        limit: 20,
        until: lastPost?.created_at 
      }))
    } else if (feedType === 'following' && followedPubkeys.length > 0) {
      const lastPost = posts[posts.length - 1]
      dispatch(loadFollowingWithInteractions({ 
        limit: 20,
        until: lastPost?.created_at,
        authors: followedPubkeys
      }))
    }
  }, [dispatch, feedType, posts, followedPubkeys])

  // Handle post interactions
  const handlePostClick = useCallback((post: Post) => {
    navigate(`/post/${post.id}`)
  }, [navigate])

  const handleLike = useCallback((postId: string) => {
    if (!isAuthenticated) {
      console.log('User not authenticated - cannot like')
      return
    }

    // Find the post to get the author's pubkey
    const post = posts.find(p => p.id === postId)
    if (!post) {
      console.error('Post not found:', postId)
      return
    }

    // Apply optimistic update immediately
    dispatch(optimisticLike(postId))

    // Dispatch the actual like action
    dispatch(likePost({ 
      eventId: postId, 
      eventPubkey: post.pubkey 
    }))
  }, [dispatch, isAuthenticated, posts])

  const handleZap = useCallback((postId: string) => {
    // TODO: Implement zap functionality with Lightning
    console.log('Zap post:', postId)
    if (!isAuthenticated) {
      console.log('User not authenticated - cannot zap')
      return
    }
    // Zap implementation would go here when NIP-57 is implemented
  }, [isAuthenticated])

  const handleReply = useCallback((post: Post) => {
    // TODO: Implement reply functionality
    console.log('Reply to post:', post.id)
    if (!isAuthenticated) {
      console.log('User not authenticated - cannot reply')
      return
    }
    // Reply modal/page navigation would go here
  }, [isAuthenticated])

  const handleRepost = useCallback((postId: string) => {
    if (!isAuthenticated) {
      console.log('User not authenticated - cannot repost')
      return
    }

    // Find the post to get full event data
    const post = posts.find(p => p.id === postId)
    if (!post) {
      console.error('Post not found:', postId)
      return
    }

    // Apply optimistic update immediately
    dispatch(optimisticRepost(postId))

    // Dispatch the actual repost action
    dispatch(repostEvent({ 
      eventId: postId, 
      eventPubkey: post.pubkey,
      originalEvent: post
    }))
  }, [dispatch, isAuthenticated, posts])

  const handleAuthorClick = useCallback(
    createProfileNavigator(navigate, user?.pubkey),
    [navigate, user?.pubkey]
  )

  return (
    <div className={`min-h-screen bg-bg-primary ${className || ''}`}>
      {/* Page Header */}
      <div className="border-b border-border-primary bg-bg-primary/95 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4">
          <div className="py-6">
            {/* Page Title */}
            <h1 className="text-2xl font-bold text-text-primary mb-6 font-mono tracking-wider bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              TIMELINE
            </h1>
            
            {/* Feed Tabs - Redesigned with cypherpunk aesthetic */}
            <div className="relative">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 via-transparent to-accent-primary/10 opacity-50 rounded-lg blur-sm"></div>
              
              {/* Tab container */}
              <div className="relative flex bg-bg-secondary/80 backdrop-blur-sm border border-border-primary rounded-lg p-1 shadow-lg">
                {/* Sliding background indicator */}
                <div 
                  className={`absolute top-1 bottom-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-md transition-all duration-300 ease-in-out shadow-lg ${
                    !isAuthenticated 
                      ? 'left-1 right-1' // Full width when only one tab (not authenticated)
                      : feedType === 'discover' 
                        ? 'left-1 right-1/2 mr-0.5' // Left half when authenticated and discover selected
                        : 'left-1/2 right-1 ml-0.5' // Right half when authenticated and following selected
                  }`}
                  style={{
                    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
                  }}
                />
                
                {/* Discover Tab */}
                <button
                  onClick={() => setFeedType('discover')}
                  className={`relative z-10 flex-1 py-3 px-6 rounded-md font-mono text-sm font-bold tracking-wide transition-all duration-300 group ${
                    feedType === 'discover'
                      ? 'text-bg-primary shadow-lg'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      feedType === 'discover' 
                        ? 'bg-bg-primary animate-pulse' 
                        : 'bg-text-tertiary group-hover:bg-accent-primary'
                    }`} />
                    DISCOVER
                  </span>
                </button>

                {/* Following Tab - Only show if authenticated */}
                {isAuthenticated && (
                  <button
                    onClick={() => setFeedType('following')}
                    className={`relative z-10 flex-1 py-3 px-6 rounded-md font-mono text-sm font-bold tracking-wide transition-all duration-300 group ${
                      feedType === 'following'
                        ? 'text-bg-primary shadow-lg'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        feedType === 'following' 
                          ? 'bg-bg-primary animate-pulse' 
                          : 'bg-text-tertiary group-hover:bg-accent-primary'
                      }`} />
                      FOLLOWING
                    </span>
                  </button>
                )}
              </div>
              
              {/* Matrix-style scan line effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-primary/5 to-transparent animate-pulse rounded-lg pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Composer */}
      {isAuthenticated && (
        <div className="max-w-2xl mx-auto px-4 py-4 border-b border-border-primary bg-bg-primary/95 sticky top-[140px] z-10 backdrop-blur">
          <PostComposer
            placeholder="What's happening on Nostr?"
            maxLength={500}
            compact={true}
            className="shadow-lg"
          />
        </div>
      )}

      {/* Timeline Content */}
      <div className="max-w-2xl mx-auto">
        {/* Show skeleton during initial load */}
        {isLoading && posts.length === 0 ? (
          <PostListSkeleton 
            count={8} 
            className="px-4" 
          />
        ) : (
          <PostList
            posts={posts}
            isLoading={isLoading}
            error={error}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onPostClick={handlePostClick}
            onLike={handleLike}
            onZap={handleZap}
            onReply={handleReply}
            onRepost={handleRepost}
            onAuthorClick={handleAuthorClick}
            emptyMessage={
              feedType === 'discover' 
                ? "No posts found" 
                : isFetchingContacts
                  ? "Loading your follows..."
                  : followedPubkeys.length === 0
                    ? "Your following feed is empty"
                    : "No posts from your follows"
            }
            emptyDescription={
              feedType === 'discover'
                ? "Check back later for new posts"
                : isFetchingContacts
                  ? "Fetching your contact list from relays"
                  : followedPubkeys.length === 0
                    ? "Follow some users to see their posts here"
                    : "Your followed users haven't posted recently"
            }
          />
        )}
      </div>
    </div>
  )
}

export default TimelinePage; 