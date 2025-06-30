/**
 * @fileoverview PostList component for displaying feeds of posts
 * Handles rendering lists of posts with infinite scroll, loading states, and error handling
 * Supports both timeline and following feeds with optimized rendering
 */

import { memo, useCallback, useEffect, useRef } from 'react'
import type { Post, PublicKey } from '@/types'
import { PostCard } from './PostCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'

interface PostListProps {
  /** Array of posts to display */
  posts: Post[]
  /** Whether the list is currently loading */
  isLoading: boolean
  /** Error message if loading failed */
  error: string | null
  /** Whether there are more posts to load */
  hasMore: boolean
  /** Callback to load more posts */
  onLoadMore?: () => void
  /** Callback when a post is clicked */
  onPostClick?: (post: Post) => void
  /** Callback when like button is clicked */
  onLike?: (postId: string) => void
  /** Callback when zap button is clicked */
  onZap?: (postId: string) => void
  /** Callback when reply button is clicked */
  onReply?: (post: Post) => void
  /** Callback when repost button is clicked */
  onRepost?: (postId: string) => void
  /** Callback when author is clicked */
  onAuthorClick?: (pubkey: PublicKey) => void
  /** Custom empty state message */
  emptyMessage?: string
  /** Custom empty state description */
  emptyDescription?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * PostList component displays a list of posts with infinite scroll
 * Optimizes rendering performance with memoization and efficient scroll detection
 * Provides loading states and error handling for better UX
 */
export const PostList = memo(function PostList({
  posts,
  isLoading,
  error,
  hasMore,
  onLoadMore,
  onPostClick,
  onLike,
  onZap,
  onReply,
  onRepost,
  onAuthorClick,
  emptyMessage = "No posts yet",
  emptyDescription = "Be the first to share something!",
  className,
}: PostListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Set up infinite scroll observer
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading) {
      return
    }

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first && first.isIntersecting) {
          onLoadMore()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    )

    // Observe the load more trigger
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [onLoadMore, hasMore, isLoading])

  // Handle retry on error
  const handleRetry = useCallback(() => {
    if (onLoadMore) {
      onLoadMore()
    }
  }, [onLoadMore])

  // Show error state
  if (error && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-red-400 text-lg font-medium mb-2">
          Failed to load posts
        </div>
        <div className="text-gray-500 text-center mb-4">
          {error}
        </div>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-accent-primary text-black rounded-lg hover:bg-accent-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Show empty state
  if (!isLoading && posts.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description={emptyDescription}
        className={className}
      />
    )
  }

  return (
    <div className={className}>
      {/* Posts list */}
      <div className="divide-y divide-gray-800">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostClick={onPostClick}
            onLike={onLike}
            onZap={onZap}
            onReply={onReply}
            onRepost={onRepost}
            onAuthorClick={onAuthorClick}
          />
        ))}
      </div>

      {/* Loading state for infinite scroll */}
      {hasMore && (
        <div 
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {isLoading ? (
            <LoadingSpinner size="md" />
          ) : (
            <div className="text-gray-500 text-sm">
              Scroll to load more posts
            </div>
          )}
        </div>
      )}

      {/* End of feed indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500 text-sm">
            You've reached the end
          </div>
        </div>
      )}

      {/* Error state for additional posts */}
      {error && posts.length > 0 && (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="text-red-400 text-sm mb-2">
            Failed to load more posts
          </div>
          <button
            onClick={handleRetry}
            className="text-accent-primary hover:text-accent-primary/80 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}) 