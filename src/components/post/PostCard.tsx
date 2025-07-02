/**
 * @fileoverview PostCard component for displaying individual posts
 * Handles post rendering, interactions, and user engagement features
 * Provides a Twitter-like post display with like, zap, reply, and repost functionality
 */

import React, { memo, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Repeat2, Zap, MoreHorizontal } from 'lucide-react'
import type { Post, PublicKey } from '@/types'
import Button from '@/components/ui/Button'
import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/utils/cn'
import { useProfileDisplay } from '@/hooks/useProfile'

interface PostCardProps {
  /** The post data to display */
  post: Post
  /** Callback fired when user clicks on the post */
  onPostClick?: (post: Post) => void
  /** Callback fired when user likes the post */
  onLike?: (postId: string) => void
  /** Callback fired when user zaps the post */
  onZap?: (postId: string) => void
  /** Callback fired when user replies to the post */
  onReply?: (post: Post) => void
  /** Callback fired when user reposts the post */
  onRepost?: (postId: string) => void
  /** Callback fired when user clicks on author profile */
  onAuthorClick?: (pubkey: PublicKey) => void
  /** Additional CSS classes */
  className?: string
  /** Whether to show interactions (for embedded contexts) */
  showInteractions?: boolean
  /** Whether post content is clickable */
  clickable?: boolean
}

/**
 * PostCard component displays individual posts with interaction capabilities
 * Supports likes, reposts, replies, and zaps based on user authentication
 * Provides responsive design for both mobile and desktop
 */
export const PostCard = memo(function PostCard({
  post,
  onPostClick,
  onLike,
  onZap,
  onReply,
  onRepost,
  onAuthorClick,
  className,
  showInteractions = true,
  clickable = true,
}: PostCardProps) {
  // Format timestamp for display
  const timeAgo = formatDistanceToNow(new Date(post.created_at * 1000), { addSuffix: true })

  // Handle post click
  const handlePostClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a')) {
      return
    }
    
    if (clickable && onPostClick) {
      onPostClick(post)
    }
  }, [clickable, onPostClick, post])

  // Handle author click
  const handleAuthorClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAuthorClick) {
      onAuthorClick(post.pubkey)
    }
  }, [onAuthorClick, post.pubkey])

  // Handle interaction clicks
  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onLike) {
      onLike(post.id)
    }
  }, [onLike, post.id])

  const handleZap = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onZap) {
      onZap(post.id)
    }
  }, [onZap, post.id])

  const handleReply = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onReply) {
      onReply(post)
    }
  }, [onReply, post])

  const handleRepost = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRepost) {
      onRepost(post.id)
    }
  }, [onRepost, post.id])

  // Get real profile data
  const profileDisplay = useProfileDisplay(post.pubkey)
  const displayName = profileDisplay.name
  const avatarUrl = profileDisplay.avatar
  const isVerified = profileDisplay.isVerified

  // Format content with basic parsing
  const formatContent = useCallback((content: string) => {
    // Simple parsing for hashtags and mentions
    return content
      .replace(/(#\w+)/g, '<span class="text-accent-primary font-medium">$1</span>')
      .replace(/(@[\w]+)/g, '<span class="text-accent-primary font-medium">$1</span>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-accent-primary hover:underline">$1</a>')
  }, [])

  return (
    <article 
      className={cn(
        'border-b border-gray-800 p-4 transition-colors',
        clickable && 'hover:bg-gray-950/50 cursor-pointer',
        className
      )}
      onClick={handlePostClick}
    >
      <div className="flex space-x-3">
        {/* Avatar */}
        <button
          onClick={handleAuthorClick}
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <Avatar
            src={avatarUrl}
            name={displayName}
            pubkey={post.pubkey}
            size="md"
          />
        </button>

        {/* Post Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <button
              onClick={handleAuthorClick}
              className="flex items-center space-x-1 hover:underline group"
            >
              <span className="font-semibold text-white group-hover:text-accent-primary">
                {displayName}
              </span>
              {isVerified && (
                <span className="text-accent-primary text-sm">✓</span>
              )}
            </button>
            <span className="text-gray-500 text-sm">·</span>
            <time className="text-gray-500 text-sm" dateTime={new Date(post.created_at * 1000).toISOString()}>
              {timeAgo}
            </time>
          </div>

          {/* Content */}
          <div className="mb-3">
            <p 
              className="text-white leading-relaxed whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
            />
          </div>

          {/* Reply context */}
          {post.reply_to && (
            <div className="mb-2 text-gray-500 text-sm">
              Replying to a post
            </div>
          )}

          {/* Interactions */}
          {showInteractions && (
            <div className="flex items-center justify-between max-w-md">
              {/* Reply */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReply}
                className="flex items-center space-x-1 text-gray-500 hover:text-accent-primary hover:bg-accent-primary/10 rounded-full p-2"
              >
                <MessageCircle size={16} />
                {(post.replies_count || 0) > 0 && (
                  <span className="text-xs">{post.replies_count}</span>
                )}
              </Button>

              {/* Repost */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRepost}
                className={cn(
                  'flex items-center space-x-1 rounded-full p-2',
                  post.is_reposted 
                    ? 'text-green-500 hover:text-green-400 hover:bg-green-500/10'
                    : 'text-gray-500 hover:text-green-500 hover:bg-green-500/10'
                )}
              >
                <Repeat2 size={16} />
                {(post.reposts_count || 0) > 0 && (
                  <span className="text-xs">{post.reposts_count}</span>
                )}
              </Button>

              {/* Like */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  'flex items-center space-x-1 rounded-full p-2',
                  post.is_liked 
                    ? 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-500/10'
                )}
              >
                <Heart size={16} className={post.is_liked ? 'fill-current' : ''} />
                {(post.likes_count || 0) > 0 && (
                  <span className="text-xs">{post.likes_count}</span>
                )}
              </Button>

              {/* Zap */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZap}
                className="flex items-center space-x-1 text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-full p-2"
              >
                <Zap size={16} />
                {(post.zaps_count || 0) > 0 && (
                  <span className="text-xs">{post.zaps_count}</span>
                )}
              </Button>

              {/* More options */}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-white hover:bg-gray-700 rounded-full p-2"
              >
                <MoreHorizontal size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}) 