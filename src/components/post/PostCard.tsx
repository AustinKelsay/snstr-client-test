/**
 * @fileoverview PostCard component for displaying individual posts
 * Handles post rendering, interactions, and user engagement features
 * Provides a Twitter-like post display with like, zap, reply, and repost functionality
 */

import React, { memo, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Repeat2, Zap, MoreHorizontal, Clock } from 'lucide-react'
import type { Post, PublicKey } from '@/types'
import Button from '@/components/ui/Button'
import { Avatar } from '@/components/common/Avatar'
import { SafeContent } from './SafeContent'
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
  const fullTimestamp = new Date(post.created_at * 1000).toISOString()

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

  return (
    <article 
      className={cn(
        'group relative bg-bg-secondary',
        'hover:bg-bg-hover transition-all duration-200',
        'p-4 sm:p-6 w-full overflow-hidden',
        'border-b border-border-primary/20',
        clickable && 'cursor-pointer',
        className
      )}
      onClick={handlePostClick}
    >
      {/* Reply context indicator */}
      {post.reply_to && (
        <div className="mb-3 flex items-center gap-2 text-text-tertiary text-xs font-mono">
          <div className="w-4 h-px bg-border-secondary" />
          <span>REPLY TO {post.reply_to.slice(0, 8)}...</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Header with inline avatar */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleAuthorClick}
            className="group/name flex items-center gap-2 hover:bg-bg-active px-2 py-1 -mx-2 -my-1 rounded transition-all duration-200"
          >
            <Avatar
              src={avatarUrl}
              name={displayName}
              pubkey={post.pubkey}
              size="sm"
              className="ring-1 ring-border-primary group-hover/name:ring-accent-primary transition-all duration-200"
            />
            <span className="font-semibold text-text-primary group-hover/name:text-accent-primary transition-colors text-lg">
              {displayName}
            </span>
            {(isVerified || profileDisplay.hasLightningAddress) && (
              <div className="flex items-center gap-1">
                {isVerified && (
                  <span 
                    className="text-purple-400 text-sm cursor-pointer hover:text-purple-300 transition-colors" 
                    title={`NIP-05 Verified: ${profileDisplay.nip05 || 'Identity verified via DNS'}`}
                  >
                    ✓
                  </span>
                )}
                {profileDisplay.hasLightningAddress && (
                  <span 
                    className="text-bitcoin text-sm cursor-pointer animate-pulse hover:text-orange-400 transition-colors" 
                    title={`Lightning Address: ${profileDisplay.lightningAddress || 'Can receive Bitcoin payments'}`}
                  >
                    ⚡
                  </span>
                )}
              </div>
            )}
          </button>
          
          <span className="text-text-quaternary font-mono text-xs">•</span>
          
          <time 
            className="text-text-secondary font-mono text-xs tracking-wider flex items-center gap-1 hover:text-text-primary transition-colors" 
            dateTime={fullTimestamp}
            title={fullTimestamp}
          >
            <Clock className="w-3 h-3" />
            {timeAgo}
          </time>
        </div>

        {/* Post Content */}
        <div className="space-y-3">
          <SafeContent 
            content={post.content}
            className="text-text-primary text-base max-w-none"
            expandable={true}
            truncateAfter={280}
            maxLines={0}
            onMentionClick={(mention) => {
              // For now, use the mention as a username to navigate
              // TODO: In the future, we could resolve mentions to actual pubkeys
              if (onAuthorClick) {
                // This is a simplified approach - in a real app you'd want to resolve the mention to a pubkey
                console.log('Mention clicked:', mention)
                // For now, just log it since we need a pubkey, not a username
              }
            }}
            onHashtagClick={(hashtag) => {
              // TODO: Implement hashtag navigation/search
              console.log('Hashtag clicked:', hashtag)
            }}
          />

          {/* Interactions */}
          {showInteractions && (
            <div className="flex items-center justify-between max-w-lg pt-2">
              {/* Reply */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReply}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-sm font-mono text-xs',
                  'text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10',
                  'transition-all duration-200 group/btn'
                )}
              >
                <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                {(post.replies_count || 0) > 0 && (
                  <span className="tabular-nums">{post.replies_count}</span>
                )}
              </Button>

              {/* Repost */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRepost}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-sm font-mono text-xs',
                  'transition-all duration-200 group/btn',
                  post.is_reposted 
                    ? 'text-success hover:text-success/80 bg-success/10 hover:bg-success/20'
                    : 'text-text-secondary hover:text-success hover:bg-success/10'
                )}
              >
                <Repeat2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                {(post.reposts_count || 0) > 0 && (
                  <span className="tabular-nums">{post.reposts_count}</span>
                )}
              </Button>

              {/* Like */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-sm font-mono text-xs',
                  'transition-all duration-200 group/btn',
                  post.is_liked 
                    ? 'text-error hover:text-error/80 bg-error/10 hover:bg-error/20'
                    : 'text-text-secondary hover:text-error hover:bg-error/10'
                )}
              >
                <Heart className={cn(
                  'w-4 h-4 group-hover/btn:scale-110 transition-transform',
                  post.is_liked && 'fill-current'
                )} />
                {(post.likes_count || 0) > 0 && (
                  <span className="tabular-nums">{post.likes_count}</span>
                )}
              </Button>

              {/* Zap */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZap}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-sm font-mono text-xs',
                  'text-text-secondary hover:text-bitcoin hover:bg-bitcoin/10',
                  'transition-all duration-200 group/btn'
                )}
              >
                <Zap className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                {(post.zaps_count || 0) > 0 && (
                  <span className="tabular-nums">{post.zaps_count}</span>
                )}
              </Button>

              {/* More options */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'p-2 rounded-sm font-mono text-xs',
                  'text-text-secondary hover:text-text-primary hover:bg-bg-active',
                  'transition-all duration-200 group/btn'
                )}
              >
                <MoreHorizontal className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              </Button>
            </div>
          )}
        </div>
      </div>

    </article>
  )
}) 