/**
 * @fileoverview ProfileCard component for compact user profile display
 * Shows avatar, name, bio snippet, verification status, and follow button
 * Used in feeds, search results, follower lists, and user mentions
 */

import React, { memo, useCallback, useState } from 'react'
import { UserPlus, UserMinus, CheckCircle, MessageCircle, MoreHorizontal, Copy, Check } from 'lucide-react'
import type { PublicKey } from '@/types'
import type { UserProfile } from '@/types/auth'
import Button from '@/components/ui/Button'
import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/utils/cn'
import { pubkeyToNpub, formatNip19ForDisplay } from '@/utils/nip19'

interface ProfileCardProps {
  /** User profile data */
  profile: UserProfile
  /** Whether this is the current user's profile */
  isOwnProfile?: boolean
  /** Whether current user is following this profile */
  isFollowing?: boolean
  /** Whether follow action is loading */
  isFollowLoading?: boolean
  /** Whether card is in horizontal layout */
  horizontal?: boolean
  /** Whether to show follow button */
  showFollowButton?: boolean
  /** Whether to show bio */
  showBio?: boolean
  /** Whether card is clickable */
  clickable?: boolean
  /** Callback fired when card is clicked */
  onClick?: (pubkey: PublicKey) => void
  /** Callback fired when follow button is clicked */
  onFollow?: (pubkey: PublicKey) => void
  /** Callback fired when unfollow button is clicked */
  onUnfollow?: (pubkey: PublicKey) => void
  /** Callback fired when message button is clicked */
  onMessage?: (pubkey: PublicKey) => void
  /** Additional CSS classes */
  className?: string
}

/**
 * ProfileCard component displays compact user profile information
 * Supports both horizontal and vertical layouts with configurable elements
 * Provides interactive elements like follow buttons and click actions
 */
export const ProfileCard = memo(function ProfileCard({
  profile,
  isOwnProfile = false,
  isFollowing = false,
  isFollowLoading = false,
  horizontal = false,
  showFollowButton = true,
  showBio = true,
  clickable = true,
  onClick,
  onFollow,
  onUnfollow,
  onMessage,
  className,
}: ProfileCardProps) {
  // State for copy functionality
  const [copiedField, setCopiedField] = useState<string | null>(null)
  
  // Format display name and username
  const displayName = profile.display_name || profile.name || `${profile.pubkey.slice(0, 8)}...${profile.pubkey.slice(-4)}`
  const username = profile.name || `${profile.pubkey.slice(0, 8)}...${profile.pubkey.slice(-4)}`
  
  // Generate NIP-19 identifiers for display
  const npubKey = pubkeyToNpub(profile.pubkey)
  const displayNpub = formatNip19ForDisplay(npubKey, { startChars: 6, endChars: 4, showPrefix: false })
  
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
  
  // Truncate bio for card display
  const shortBio = profile.about && profile.about.length > 120 
    ? `${profile.about.slice(0, 120)}...`
    : profile.about

  // Handle card click
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button')) {
      return
    }
    
    if (clickable && onClick) {
      onClick(profile.pubkey)
    }
  }, [clickable, onClick, profile.pubkey])

  // Handle follow toggle
  const handleFollowToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFollowLoading) return
    
    if (isFollowing && onUnfollow) {
      onUnfollow(profile.pubkey)
    } else if (!isFollowing && onFollow) {
      onFollow(profile.pubkey)
    }
  }, [isFollowing, isFollowLoading, onFollow, onUnfollow, profile.pubkey])

  // Handle message click
  const handleMessage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onMessage) {
      onMessage(profile.pubkey)
    }
  }, [onMessage, profile.pubkey])

  if (horizontal) {
    return (
      <div 
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg transition-colors',
          'bg-bg-secondary border border-border-primary',
          clickable && 'hover:bg-bg-hover cursor-pointer',
          className
        )}
        onClick={handleCardClick}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            src={profile.picture}
            name={displayName}
            pubkey={profile.pubkey}
            size="lg"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-text-primary truncate">
              {displayName}
            </h3>
            {profile.nip05 && (
              <CheckCircle className="w-4 h-4 text-accent-primary flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm text-text-secondary truncate">@{username}</p>
            <button
              onClick={(e) => handleCopy(npubKey, 'npub', e)}
              className="group flex-shrink-0 flex items-center gap-1 hover:bg-bg-active px-1 py-0.5 -mx-1 -my-0.5 rounded transition-all duration-200"
              title={`Copy ${npubKey}`}
            >
              <span className="font-mono text-xs text-text-tertiary group-hover:text-accent-primary transition-colors">
                {displayNpub}
              </span>
              {copiedField === 'npub' ? (
                <Check className="w-3 h-3 text-accent-primary" />
              ) : (
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 text-text-secondary group-hover:text-accent-primary transition-all duration-200" />
              )}
            </button>
          </div>
          {showBio && shortBio && (
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">
              {shortBio}
            </p>
          )}
        </div>

        {/* Actions */}
        {!isOwnProfile && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {onMessage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMessage}
                className="p-2"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
            
            {showFollowButton && (onFollow || onUnfollow) && (
              <Button
                variant={isFollowing ? "secondary" : "primary"}
                size="sm"
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className="flex items-center gap-2 min-w-[80px]"
              >
                {isFollowLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    <span className="hidden sm:inline">Unfollow</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Follow</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  // Vertical layout (default)
  return (
    <div 
      className={cn(
        'flex flex-col p-4 rounded-lg transition-colors',
        'bg-bg-secondary border border-border-primary',
        clickable && 'hover:bg-bg-hover cursor-pointer',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Header with avatar and actions */}
      <div className="flex items-start justify-between mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            src={profile.picture}
            name={displayName}
            pubkey={profile.pubkey}
            size="xl"
          />
        </div>

        {/* Action buttons */}
        {!isOwnProfile && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Profile info */}
      <div className="space-y-2">
        {/* Names */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-text-primary">
              {displayName}
            </h3>
            {profile.nip05 && (
              <CheckCircle className="w-4 h-4 text-accent-primary" />
            )}
          </div>
          <p className="text-sm text-text-secondary">@{username}</p>
          {profile.nip05 && (
            <p className="text-xs text-accent-primary">✓ {profile.nip05}</p>
          )}
        </div>

        {/* Bio */}
        {showBio && shortBio && (
          <p className="text-sm text-text-secondary leading-relaxed">
            {shortBio}
          </p>
        )}

        {/* Actions */}
        {!isOwnProfile && showFollowButton && (onFollow || onUnfollow) && (
          <div className="flex items-center gap-2 pt-2">
            {onMessage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMessage}
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span>Message</span>
              </Button>
            )}
            
            <Button
              variant={isFollowing ? "secondary" : "primary"}
              size="sm"
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isFollowLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4" />
                  <span>Unfollow</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Follow</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
})

export default ProfileCard 