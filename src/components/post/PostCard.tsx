/**
 * @fileoverview PostCard component for displaying individual posts
 * Handles post rendering, interactions, and user engagement features with granular skeleton loading
 * Provides a Twitter-like post display with field-level skeleton loading for profile data
 */

import React, { memo, useCallback, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Repeat2, Zap, MoreHorizontal, Clock, Copy, Check } from 'lucide-react'
import type { Post, PublicKey } from '@/types'
import Button from '@/components/ui/Button'
import { Avatar } from '@/components/common/Avatar'
import { SafeContent } from './SafeContent'
import { cn } from '@/utils/cn'
import { useGranularProfile } from '@/hooks/useGranularProfile'
import { 
  SkeletonName, 
  SkeletonVerificationBadge,
  SkeletonOr
} from '@/components/common/MicroSkeletons'
import { SkeletonAvatar } from '@/components/common/Skeleton'
import { eventIdToNote, formatNip19ForDisplay, extractPubkey, extractEventId, isNip19Entity } from '@/utils/nip19'

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
 * PostCard component displays individual posts with granular skeleton loading
 * Individual profile fields show skeleton loading while post content renders normally
 * This enables "no more Unknown User" experience - skeleton loading at field level
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
  // State for copy functionality
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Use granular profile loading for field-level skeleton states
  const { data: profileData, loading: profileLoading } = useGranularProfile(post.pubkey)

  // Format timestamp for display
  const timeAgo = formatDistanceToNow(new Date(post.created_at * 1000), { addSuffix: true })
  const fullTimestamp = new Date(post.created_at * 1000).toISOString()

  // Generate NIP-19 note identifier
  const noteId = eventIdToNote(post.id)
  const displayNote = formatNip19ForDisplay(noteId, { startChars: 8, endChars: 6, showPrefix: false })

  // Copy to clipboard functionality
  const handleCopy = useCallback(async (text: string, field: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [])

  // Handle mention click (for NIP-19 entities)
  const handleMentionClick = useCallback((mention: string) => {
    if (isNip19Entity(mention)) {
      const pubkey = extractPubkey(mention)
      if (pubkey && onAuthorClick) {
        onAuthorClick(pubkey)
      }
    } else {
      // Traditional @username mention - log for now
      console.log('Username mention clicked:', mention)
    }
  }, [onAuthorClick])

  // Handle NIP-19 entity clicks
  const handleNip19Click = useCallback((entity: string, type: 'pubkey' | 'event') => {
    if (type === 'pubkey') {
      const pubkey = extractPubkey(entity)
      if (pubkey && onAuthorClick) {
        onAuthorClick(pubkey)
      }
    } else if (type === 'event') {
      const eventId = extractEventId(entity)
      if (eventId && onPostClick) {
        // Create a minimal post object for navigation
        const eventPost = { 
          id: eventId, 
          content: `Referenced event: ${entity}`,
          pubkey: '',
          created_at: 0
        } as Post
        onPostClick(eventPost)
      }
    }
  }, [onAuthorClick, onPostClick])

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
        {/* Header with inline avatar and granular skeleton loading */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleAuthorClick}
            className="group/name flex items-center gap-2 hover:bg-bg-active px-2 py-1 -mx-2 -my-1 rounded transition-all duration-200"
          >
            {/* Avatar with granular loading */}
            {profileLoading.fields.avatar ? (
              <SkeletonAvatar size="sm" />
            ) : (
              <Avatar
                src={profileData.fields.avatar}
                name={profileData.fields.name}
                pubkey={post.pubkey}
                size="sm"
                className="transition-all duration-200"
              />
            )}
            
            {/* Display name with granular loading */}
            <SkeletonOr
              loading={profileLoading.fields.name}
              skeleton={<SkeletonName variant="medium" />}
            >
              <span className="font-semibold text-text-primary group-hover/name:text-accent-primary transition-colors text-lg">
                {profileData.fields.name}
              </span>
            </SkeletonOr>
            
            {/* Verification badges with granular loading */}
            <SkeletonOr
              loading={profileLoading.fields.verification}
              skeleton={<SkeletonVerificationBadge className="opacity-60" />}
            >
              <div className="flex items-center gap-1">
                {profileData.fields.isVerified && (
                  <span 
                    className="text-purple-400 text-sm cursor-pointer hover:text-purple-300 transition-colors" 
                    title={`NIP-05 Verified: ${profileData.fields.nip05 || 'Identity verified via DNS'}`}
                  >
                    ✓
                  </span>
                )}
                {profileData.fields.lightningAddress && (
                  <span 
                    className="text-bitcoin text-sm cursor-pointer animate-pulse hover:text-orange-400 transition-colors" 
                    title={`Lightning Address: ${profileData.fields.lightningAddress}`}
                  >
                    ⚡
                  </span>
                )}
              </div>
            </SkeletonOr>
          </button>
          
          <span className="text-text-quaternary font-mono text-xs">•</span>
          
          {/* Timestamp - always available from post data */}
          <button
            onClick={(e) => handleCopy(fullTimestamp, 'timestamp', e)}
            className="group/time flex items-center gap-1 hover:bg-bg-active px-1 py-0.5 -mx-1 -my-0.5 rounded transition-all duration-200"
            title={`Posted at ${fullTimestamp}`}
          >
            <Clock className="w-3 h-3 text-text-quaternary group-hover/time:text-accent-primary transition-colors" />
            <span className="font-mono text-xs text-text-tertiary group-hover/time:text-accent-primary transition-colors">
              {timeAgo}
            </span>
            {copiedField === 'timestamp' ? (
              <Check className="w-3 h-3 text-accent-primary" />
            ) : (
              <Copy className="w-3 h-3 opacity-0 group-hover/time:opacity-100 text-text-secondary group-hover/time:text-accent-primary transition-all duration-200" />
            )}
          </button>
        </div>

        {/* Post metadata with some skeleton loading */}
        <div className="flex items-center gap-3 font-mono text-xs text-text-quaternary">
          <button
            onClick={(e) => handleCopy(noteId, 'note', e)}
            className="group/note flex items-center gap-1 hover:bg-bg-active px-1 py-0.5 -mx-1 -my-0.5 rounded transition-all duration-200"
            title={`Note ID: ${noteId}`}
          >
            <span className="group-hover/note:text-accent-primary transition-colors">
              {displayNote}
            </span>
            {copiedField === 'note' ? (
              <Check className="w-3 h-3 text-accent-primary" />
            ) : (
              <Copy className="w-3 h-3 opacity-0 group-hover/note:opacity-100 text-text-secondary group-hover/note:text-accent-primary transition-all duration-200" />
            )}
          </button>
          
          <span>•</span>
          
          {/* Relay info could also be skeleton loaded if from dynamic sources */}
          <span className="opacity-60">via relay</span>
        </div>

        {/* Post content - always available from post data */}
        <div className="space-y-3">
          <SafeContent 
            content={post.content}
            className="text-text-primary text-base max-w-none"
            expandable={true}
            truncateAfter={280}
            maxLines={0}
            convertEmojis={true}
            onMentionClick={handleMentionClick}
            onNip19Click={handleNip19Click}
            onHashtagClick={(hashtag) => {
              // TODO: Implement hashtag navigation/search
              console.log('Hashtag clicked:', hashtag)
            }}
            onEmojiClick={(emojiName) => {
              // TODO: Implement emoji picker or custom emoji handling
              console.log('Emoji clicked:', emojiName)
            }}
          />

          {/* Interactions - can show skeleton for counts if they're loading */}
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
                  'flex items-center gap-2 px-3 py-2 rounded-sm font-mono text-xs',
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