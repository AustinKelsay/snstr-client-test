/**
 * @fileoverview PostList component for displaying feeds of posts
 * Handles rendering lists of posts with infinite scroll, loading states, and error handling
 * Optimized for both timeline and following feeds with responsive design for large messages
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
 * Enhanced to handle large messages with proper overflow and responsive design
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
      <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
        <div className="text-error text-lg font-medium text-center">
          Failed to load posts
        </div>
        <div className="text-text-secondary text-center text-sm max-w-md">
          {error}
        </div>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-accent-primary text-bg-primary rounded-sm hover:bg-accent-secondary transition-colors font-mono text-sm"
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
      {/* Posts list with subtle dividers */}
      <div className="space-y-0 divide-y divide-border-primary overflow-hidden">
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
            className="!border-b-0"
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
            <div className="flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <span className="text-text-secondary text-sm font-mono">
                Loading more posts...
              </span>
            </div>
          ) : (
            <div className="text-text-secondary text-sm font-mono">
              Scroll to load more posts
            </div>
          )}
        </div>
      )}

      {/* End of feed indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-mono">
            <div className="w-4 h-px bg-border-secondary" />
            <span>End of feed</span>
            <div className="w-4 h-px bg-border-secondary" />
          </div>
        </div>
      )}

      {/* Error state for additional posts */}
      {error && posts.length > 0 && (
        <div className="flex flex-col items-center justify-center py-8 px-4 space-y-2">
          <div className="text-error text-sm font-mono">
            Failed to load more posts
          </div>
          <button
            onClick={handleRetry}
            className="text-accent-primary hover:text-accent-secondary text-sm underline font-mono transition-colors"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}) 