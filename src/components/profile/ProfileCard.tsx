/**
 * @fileoverview ProfileCard component for compact user profile display with granular skeleton loading
 * Shows avatar, name, bio snippet, verification status, and follow button
 * Individual profile fields show skeleton loading while other fields show real data
 * Used in feeds, search results, follower lists, and user mentions
 */

import React, { memo, useCallback } from 'react'
import { UserPlus, UserMinus, CheckCircle, MessageCircle, MoreHorizontal } from 'lucide-react'
import type { PublicKey } from '@/types'

import Button from '@/components/ui/Button'
import { Avatar } from '@/components/common/Avatar'
import { CopyButton } from '@/components/common/CopyButton'
import { cn } from '@/utils/cn'
import { pubkeyToNpub, formatNip19ForDisplay } from '@/utils/nip19'
import { useGranularProfile } from '@/hooks/useGranularProfile'
import { 
  SkeletonName, 
  SkeletonUsername,
  SkeletonBio,
  SkeletonNip05,
  SkeletonOr
} from '@/components/common/MicroSkeletons'
import { SkeletonAvatar } from '@/components/common/Skeleton'

interface ProfileCardProps {
  /** User public key to load profile for */
  pubkey: PublicKey
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
 * ProfileCard component displays compact user profile information with granular skeleton loading
 * Individual fields show skeleton loading while other fields display real data
 * Supports both horizontal and vertical layouts with configurable elements
 * Provides interactive elements like follow buttons and click actions
 */
export const ProfileCard = memo(function ProfileCard({
  pubkey,
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
  // Use granular profile loading for field-level skeleton states
  const { data: profileData, loading: profileLoading } = useGranularProfile(pubkey)
  
  // Generate NIP-19 identifiers for display
  const npubKey = pubkeyToNpub(pubkey)
  const displayNpub = formatNip19ForDisplay(npubKey, { startChars: 6, endChars: 4, showPrefix: false })
  
  // Truncate bio for card display
  const shortBio = profileData.fields.bio && profileData.fields.bio.length > 120 
    ? `${profileData.fields.bio.slice(0, 120)}...`
    : profileData.fields.bio

  // Handle card click
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button')) {
      return
    }
    
    if (clickable && onClick) {
      onClick(pubkey)
    }
  }, [clickable, onClick, pubkey])

  // Handle follow toggle
  const handleFollowToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFollowLoading) return
    
    if (isFollowing && onUnfollow) {
      onUnfollow(pubkey)
    } else if (!isFollowing && onFollow) {
      onFollow(pubkey)
    }
  }, [isFollowing, isFollowLoading, onFollow, onUnfollow, pubkey])

  // Handle message click
  const handleMessage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onMessage) {
      onMessage(pubkey)
    }
  }, [onMessage, pubkey])

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
        {/* Avatar with granular loading */}
        <div className="flex-shrink-0">
          <SkeletonOr
            loading={profileLoading.fields.avatar}
            skeleton={<SkeletonAvatar size="lg" />}
          >
            <Avatar
              src={profileData.fields.avatar}
              name={profileData.fields.name}
              pubkey={pubkey}
              size="lg"
            />
          </SkeletonOr>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Display name with granular loading */}
            <SkeletonOr
              loading={profileLoading.fields.name}
              skeleton={<SkeletonName variant="medium" />}
            >
              <h3 className="font-semibold text-text-primary truncate">
                {profileData.fields.name}
              </h3>
            </SkeletonOr>
            
            {/* Verification badge with granular loading */}
            <SkeletonOr
              loading={profileLoading.fields.verification}
              skeleton={<CheckCircle className="w-4 h-4 text-bg-tertiary animate-pulse" />}
            >
              {profileData.fields.nip05 && (
                <CheckCircle className="w-4 h-4 text-accent-primary flex-shrink-0" />
              )}
            </SkeletonOr>
          </div>
          
          <div className="flex items-center gap-2 min-w-0">
            {/* Username with granular loading */}
            <SkeletonOr
              loading={profileLoading.fields.username}
              skeleton={<SkeletonUsername />}
            >
              <p className="text-sm text-text-secondary truncate">@{profileData.fields.username}</p>
            </SkeletonOr>
            
            <CopyButton
              text={npubKey}
              displayText={displayNpub}
              variant="ghost"
              size="sm"
              formatNip19={false}
              className="flex-shrink-0 font-mono text-xs text-text-tertiary hover:text-accent-primary transition-colors"
            />
          </div>
          
          {/* Bio with granular loading */}
          {showBio && (
            <SkeletonOr
              loading={profileLoading.fields.bio}
              skeleton={<SkeletonBio lines={2} className="mt-1" />}
            >
              {shortBio && (
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                  {shortBio}
                </p>
              )}
            </SkeletonOr>
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
        {/* Avatar with granular loading */}
        <div className="flex-shrink-0">
          <SkeletonOr
            loading={profileLoading.fields.avatar}
            skeleton={<SkeletonAvatar size="xl" />}
          >
            <Avatar
              src={profileData.fields.avatar}
              name={profileData.fields.name}
              pubkey={pubkey}
              size="xl"
            />
          </SkeletonOr>
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
            {/* Display name with granular loading */}
            <SkeletonOr
              loading={profileLoading.fields.name}
              skeleton={<SkeletonName variant="long" />}
            >
              <h3 className="font-semibold text-text-primary">
                {profileData.fields.name}
              </h3>
            </SkeletonOr>
            
            {/* Verification badge with granular loading */}
            <SkeletonOr
              loading={profileLoading.fields.verification}
              skeleton={<CheckCircle className="w-4 h-4 text-bg-tertiary animate-pulse" />}
            >
              {profileData.fields.nip05 && (
                <CheckCircle className="w-4 h-4 text-accent-primary" />
              )}
            </SkeletonOr>
          </div>
          
          {/* Username with granular loading */}
          <div className="flex items-center gap-2">
            <SkeletonOr
              loading={profileLoading.fields.username}
              skeleton={<SkeletonUsername />}
            >
              <p className="text-sm text-text-secondary">@{profileData.fields.username}</p>
            </SkeletonOr>
            
            <CopyButton
              text={npubKey}
              displayText={displayNpub}
              variant="ghost"
              size="sm"
              formatNip19={false}
              className="flex-shrink-0 font-mono text-xs text-text-tertiary hover:text-accent-primary transition-colors"
            />
          </div>
          
          {/* NIP-05 with granular loading */}
          <SkeletonOr
            loading={profileLoading.fields.nip05}
            skeleton={<SkeletonNip05 className="mt-1" />}
          >
            {profileData.fields.nip05 && (
              <p className="text-xs text-accent-primary">✓ {profileData.fields.nip05}</p>
            )}
          </SkeletonOr>
        </div>

        {/* Bio with granular loading */}
        {showBio && (
          <SkeletonOr
            loading={profileLoading.fields.bio}
            skeleton={<SkeletonBio lines={3} />}
          >
            {shortBio && (
              <p className="text-sm text-text-secondary leading-relaxed">
                {shortBio}
              </p>
            )}
          </SkeletonOr>
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