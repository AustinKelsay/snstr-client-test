/**
 * @fileoverview Timeline page component for displaying user timeline
 * Shows chronological posts with feed switching between Discover and Following
 * Features infinite scroll, real-time updates, and post interactions
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { loadTimelinePosts, loadFollowingPosts } from '@/store/slices/postsSlice'
import { fetchUserContacts } from '@/store/slices/contactsSlice'
import { likePost, repostEvent, optimisticLike, optimisticRepost } from '@/store/slices/interactionsSlice'
import { selectFeedPosts, selectIsFeedLoading, selectFeedError, selectHasMoreFeed } from '@/store/selectors'
import { selectFollowedPubkeys, selectIsFetchingContacts } from '@/store/selectors/contactsSelectors'
import { PostList, PostComposer } from '@/components/post'
import type { FeedType, Post, PublicKey } from '@/types'

export interface TimelinePageProps {
  className?: string
}

/**
 * Timeline page component displays the main feed of posts
 * Features feed switching, infinite scroll, real-time updates, and post interactions
 */
export function TimelinePage({ className }: TimelinePageProps) {
  const dispatch = useAppDispatch()
  const [feedType, setFeedType] = useState<FeedType>('discover')

  // Selectors
  const posts = useAppSelector((state) => selectFeedPosts(state, feedType))
  const isLoading = useAppSelector((state) => selectIsFeedLoading(state, feedType))
  const error = useAppSelector((state) => selectFeedError(state, feedType))
  const hasMore = useAppSelector((state) => selectHasMoreFeed(state, feedType))
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const followedPubkeys = useAppSelector(selectFollowedPubkeys)
  const isFetchingContacts = useAppSelector(selectIsFetchingContacts)

  // Fetch user contacts when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.pubkey) {
      dispatch(fetchUserContacts(user.pubkey))
    }
  }, [dispatch, isAuthenticated, user?.pubkey])

  // Load initial posts
  useEffect(() => {
    if (feedType === 'discover') {
      dispatch(loadTimelinePosts({ limit: 20 }))
    } else if (feedType === 'following' && isAuthenticated) {
      // Use actual followed pubkeys instead of empty array
      if (followedPubkeys.length > 0) {
        dispatch(loadFollowingPosts({ limit: 20, authors: followedPubkeys }))
      }
    }
  }, [dispatch, feedType, isAuthenticated, followedPubkeys])

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (feedType === 'discover') {
      const lastPost = posts[posts.length - 1]
      dispatch(loadTimelinePosts({ 
        limit: 20,
        until: lastPost?.created_at 
      }))
    } else if (feedType === 'following' && followedPubkeys.length > 0) {
      const lastPost = posts[posts.length - 1]
      dispatch(loadFollowingPosts({ 
        limit: 20,
        until: lastPost?.created_at,
        authors: followedPubkeys
      }))
    }
  }, [dispatch, feedType, posts, followedPubkeys])

  // Handle post interactions
  const handlePostClick = useCallback((post: Post) => {
    // TODO: Navigate to post detail page
    console.log('Post clicked:', post.id)
  }, [])

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

  const handleAuthorClick = useCallback((pubkey: PublicKey) => {
    // TODO: Navigate to user profile
    console.log('Author clicked:', pubkey)
  }, [])

  return (
    <div className={`min-h-screen bg-black ${className || ''}`}>
      {/* Page Header */}
      <div className="border-b border-gray-800 bg-black/95 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-white mb-4">Timeline</h1>
            
            {/* Feed Tabs */}
            <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setFeedType('discover')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  feedType === 'discover'
                    ? 'bg-accent-primary text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Discover
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => setFeedType('following')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    feedType === 'following'
                      ? 'bg-accent-primary text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Following
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Composer */}
      {isAuthenticated && (
        <div className="max-w-2xl mx-auto px-4 py-4 border-b border-gray-800 bg-black/95 sticky top-[120px] z-10 backdrop-blur">
          <PostComposer
            placeholder="What's happening on Nostr?"
            maxLength={500}
            className="bg-gray-900"
          />
        </div>
      )}

      {/* Timeline Content */}
      <div className="max-w-2xl mx-auto">
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
      </div>
    </div>
  )
}

export default TimelinePage; 