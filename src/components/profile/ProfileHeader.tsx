/**
 * @fileoverview ProfileHeader component for displaying user profile headers
 * Shows avatar, name, bio, verification status, follower counts, and action buttons
 * Supports both current user and other user profiles with appropriate action states
 */

import React, { memo, useCallback } from 'react'
import { Settings, UserPlus, UserMinus, MessageCircle, MoreHorizontal, CheckCircle, Link as LinkIcon, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { PublicKey } from '@/types'
import type { UserProfile } from '@/types/auth'
import Button from '@/components/ui/Button'
import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/utils/cn'

interface ProfileHeaderProps {
  /** User profile data */
  profile: UserProfile
  /** Whether this is the current user's profile */
  isOwnProfile?: boolean
  /** Whether current user is following this profile */
  isFollowing?: boolean
  /** Whether follow action is loading */
  isFollowLoading?: boolean
  /** Follower count */
  followerCount?: number
  /** Following count */
  followingCount?: number
  /** Post count */
  postCount?: number
  /** Callback fired when follow button is clicked */
  onFollow?: (pubkey: PublicKey) => void
  /** Callback fired when unfollow button is clicked */
  onUnfollow?: (pubkey: PublicKey) => void
  /** Callback fired when message button is clicked */
  onMessage?: (pubkey: PublicKey) => void
  /** Callback fired when edit profile is clicked */
  onEditProfile?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * ProfileHeader component displays comprehensive user profile information
 * Includes avatar, names, bio, verification status, stats, and action buttons
 * Adapts interface based on whether profile belongs to current user
 */
export const ProfileHeader = memo(function ProfileHeader({
  profile,
  isOwnProfile = false,
  isFollowing = false,
  isFollowLoading = false,
  followerCount = 0,
  followingCount = 0,
  postCount = 0,
  onFollow,
  onUnfollow,
  onMessage,
  onEditProfile,
  className,
}: ProfileHeaderProps) {
  
  // Format display name
  const displayName = profile.display_name || profile.name || `${profile.pubkey.slice(0, 8)}...${profile.pubkey.slice(-4)}`
  const username = profile.name || `${profile.pubkey.slice(0, 8)}...${profile.pubkey.slice(-4)}`

  // Format join date (using created_at if available)
  const joinDate = new Date() // TODO: Get actual join date from profile metadata
  const joinDateStr = formatDistanceToNow(joinDate, { addSuffix: true })

  // Handle follow toggle
  const handleFollowToggle = useCallback(() => {
    if (isFollowLoading) return
    
    if (isFollowing && onUnfollow) {
      onUnfollow(profile.pubkey)
    } else if (!isFollowing && onFollow) {
      onFollow(profile.pubkey)
    }
  }, [isFollowing, isFollowLoading, onFollow, onUnfollow, profile.pubkey])

  // Handle message click
  const handleMessage = useCallback(() => {
    if (onMessage) {
      onMessage(profile.pubkey)
    }
  }, [onMessage, profile.pubkey])

  // Handle edit profile click
  const handleEditProfile = useCallback(() => {
    if (onEditProfile) {
      onEditProfile()
    }
  }, [onEditProfile])

  return (
    <div className={cn('relative bg-bg-secondary border-b border-border-primary', className)}>
      {/* Banner */}
      <div 
        className="h-48 sm:h-64 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 relative"
        style={{
          backgroundImage: profile.banner ? `url(${profile.banner})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Banner overlay for text readability */}
        {profile.banner && (
          <div className="absolute inset-0 bg-bg-primary/40" />
        )}
      </div>

      {/* Profile content */}
      <div className="relative px-4 sm:px-6 pb-6">
        {/* Avatar */}
        <div className="flex items-start justify-between -mt-16 sm:-mt-20 mb-4">
          <div className="relative">
            <div className="border-4 border-bg-secondary rounded-full">
              <Avatar
                src={profile.picture}
                name={displayName}
                pubkey={profile.pubkey}
                size="xl"
                className="w-24 h-24 sm:w-32 sm:h-32"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4">
            {isOwnProfile ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleEditProfile}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMessage}
                  className="p-2"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>

                <Button
                  variant={isFollowing ? "secondary" : "primary"}
                  size="sm"
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className="flex items-center gap-2 min-w-[90px]"
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
              </>
            )}
          </div>
        </div>

        {/* Profile info */}
        <div className="space-y-3">
          {/* Names */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                {displayName}
              </h1>
              {profile.nip05 && (
                <CheckCircle className="w-5 h-5 text-accent-primary" />
              )}
            </div>
            <p className="text-text-secondary">@{username}</p>
            {profile.nip05 && (
              <p className="text-sm text-accent-primary">✓ {profile.nip05}</p>
            )}
          </div>

          {/* Bio */}
          {profile.about && (
            <div className="max-w-lg">
              <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                {profile.about}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            {/* Website */}
            {profile.website && (
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-accent-primary"
              >
                <LinkIcon className="w-4 h-4" />
                <span>{profile.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}

            {/* Join date */}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {joinDateStr}</span>
            </div>

            {/* Lightning address */}
            {(profile.lud16 || profile.lud06) && (
              <div className="flex items-center gap-1 text-bitcoin">
                <span>⚡</span>
                <span>{profile.lud16 || 'Lightning enabled'}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-text-primary">{postCount}</span>
              <span className="text-text-secondary">Posts</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-text-primary">{followingCount}</span>
              <span className="text-text-secondary">Following</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-text-primary">{followerCount}</span>
              <span className="text-text-secondary">Followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ProfileHeader 