/**
 * @fileoverview Timeline page component for displaying user timeline
 * Shows chronological posts with feed switching between Discover and Following
 * Features infinite scroll, real-time updates, and post interactions
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { loadTimelinePosts, loadFollowingPosts } from '@/store/slices/postsSlice'
import { selectFeedPosts, selectIsFeedLoading, selectFeedError, selectHasMoreFeed } from '@/store/selectors'
import { PostList } from '@/components/post'
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
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  // Load initial posts
  useEffect(() => {
    if (feedType === 'discover') {
      dispatch(loadTimelinePosts({ limit: 20 }))
    } else if (feedType === 'following' && isAuthenticated) {
      // TODO: Get user's follows and load their posts
      dispatch(loadFollowingPosts({ limit: 20, authors: [] }))
    }
  }, [dispatch, feedType, isAuthenticated])

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (feedType === 'discover') {
      const lastPost = posts[posts.length - 1]
      dispatch(loadTimelinePosts({ 
        limit: 20,
        until: lastPost?.created_at 
      }))
    } else if (feedType === 'following') {
      const lastPost = posts[posts.length - 1]
      dispatch(loadFollowingPosts({ 
        limit: 20,
        until: lastPost?.created_at,
        authors: [] // TODO: Get user's follows
      }))
    }
  }, [dispatch, feedType, posts])

  // Handle post interactions
  const handlePostClick = useCallback((post: Post) => {
    // TODO: Navigate to post detail page
    console.log('Post clicked:', post.id)
  }, [])

  const handleLike = useCallback((postId: string) => {
    // TODO: Implement like functionality
    console.log('Like post:', postId)
  }, [])

  const handleZap = useCallback((postId: string) => {
    // TODO: Implement zap functionality  
    console.log('Zap post:', postId)
  }, [])

  const handleReply = useCallback((post: Post) => {
    // TODO: Implement reply functionality
    console.log('Reply to post:', post.id)
  }, [])

  const handleRepost = useCallback((postId: string) => {
    // TODO: Implement repost functionality
    console.log('Repost:', postId)
  }, [])

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
              : "Your following feed is empty"
          }
          emptyDescription={
            feedType === 'discover'
              ? "Check back later for new posts"
              : "Follow some users to see their posts here"
          }
        />
      </div>
    </div>
  )
}

export default TimelinePage; 