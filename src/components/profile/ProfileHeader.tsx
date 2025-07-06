/**
 * @fileoverview ProfileHeader component for displaying user profile headers with granular skeleton loading
 * Shows avatar, name, bio, verification status, follower counts, and action buttons
 * Individual profile fields show skeleton loading while other fields show real data
 * Supports both current user and other user profiles with appropriate action states
 */

import { memo, useCallback, useState } from 'react'
import { Settings, UserPlus, UserMinus, MessageCircle, MoreHorizontal, CheckCircle, Link as LinkIcon, Calendar, Zap, Shield, Copy, Check } from 'lucide-react'
import type { PublicKey } from '@/types'
import Button from '@/components/ui/Button'
import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/utils/cn'
import { pubkeyToNpub, formatNip19ForDisplay } from '@/utils/nip19'
import { useGranularProfile } from '@/hooks/useGranularProfile'
import { 
  SkeletonName, 
  SkeletonUsername,
  SkeletonBio,
  SkeletonNip05,
  SkeletonWebsite,
  SkeletonLightningAddress,
  SkeletonFollowerCount,
  SkeletonOr
} from '@/components/common/MicroSkeletons'
import { SkeletonAvatar, Skeleton } from '@/components/common/Skeleton'

interface ProfileHeaderProps {
  /** User public key to load profile for */
  pubkey: PublicKey
  /** Whether this is the current user's profile */
  isOwnProfile?: boolean
  /** Whether current user is following this profile */
  isFollowing?: boolean
  /** Whether follow action is loading */
  isFollowLoading?: boolean
  /** Follower count (could be loading separately) */
  followerCount?: number
  /** Following count (could be loading separately) */
  followingCount?: number
  /** Post count (could be loading separately) */
  postCount?: number
  /** Whether follower stats are loading */
  statsLoading?: boolean
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
 * ProfileHeader component displays user profile headers with granular skeleton loading
 * Individual profile fields show skeleton loading while other fields display real data
 * Provides comprehensive profile information with action buttons and stats
 */
export const ProfileHeader = memo(function ProfileHeader({
  pubkey,
  isOwnProfile = false,
  isFollowing = false,
  isFollowLoading = false,
  followerCount,
  followingCount,
  postCount,
  statsLoading = false,
  onFollow,
  onUnfollow,
  onMessage,
  onEditProfile,
  className,
}: ProfileHeaderProps) {
  // State for copy functionality
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Use granular profile loading for field-level skeleton states
  const { data: profileData, loading: profileLoading } = useGranularProfile(pubkey)

  // Generate NIP-19 identifiers for display
  const npubKey = pubkeyToNpub(pubkey)
  const displayNpub = formatNip19ForDisplay(npubKey, { startChars: 8, endChars: 6, showPrefix: false })

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

  // Handle follow toggle
  const handleFollowToggle = useCallback(() => {
    if (isFollowLoading) return
    
    if (isFollowing && onUnfollow) {
      onUnfollow(pubkey)
    } else if (!isFollowing && onFollow) {
      onFollow(pubkey)
    }
  }, [isFollowing, isFollowLoading, onFollow, onUnfollow, pubkey])

  // Handle message click
  const handleMessage = useCallback(() => {
    if (onMessage) {
      onMessage(pubkey)
    }
  }, [onMessage, pubkey])

  return (
    <div className={cn('relative bg-bg-secondary rounded-lg overflow-hidden', className)}>
      {/* Banner section with granular loading */}
      <div className="relative h-48 bg-gradient-to-br from-bg-tertiary to-bg-quaternary">
        <SkeletonOr
          loading={profileLoading.fields.banner}
          skeleton={
            <div className="absolute inset-0 bg-gradient-to-br from-bg-tertiary to-bg-quaternary">
              <Skeleton variant="card" width="100%" height="100%" className="rounded-none" />
            </div>
          }
        >
          {profileData.fields.banner ? (
            <img 
              src={profileData.fields.banner} 
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-bg-tertiary to-bg-quaternary" />
          )}
        </SkeletonOr>
        
        {/* Avatar overlaid on banner with granular loading */}
        <div className="absolute -bottom-12 left-6">
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
      </div>

      {/* Profile info section */}
      <div className="pt-16 px-6 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {/* Display name with granular loading */}
            <SkeletonOr
              loading={profileLoading.fields.name}
              skeleton={<SkeletonName variant="long" className="text-2xl" />}
            >
              <h1 className="text-2xl font-bold text-text-primary mb-1">
                {profileData.fields.name}
              </h1>
            </SkeletonOr>
            
            {/* Username with granular loading */}
            <SkeletonOr
              loading={profileLoading.fields.username}
              skeleton={<SkeletonUsername className="text-lg mb-2" />}
            >
              <p className="text-lg text-text-secondary mb-2">@{profileData.fields.username}</p>
            </SkeletonOr>

            {/* Bio with granular loading */}
            <SkeletonOr
              loading={profileLoading.fields.bio}
              skeleton={<SkeletonBio lines={3} className="mb-4 max-w-2xl" />}
            >
              {profileData.fields.bio && (
                <p className="text-base text-text-primary mb-4 max-w-2xl leading-relaxed">
                  {profileData.fields.bio}
                </p>
              )}
            </SkeletonOr>

            {/* Additional profile info with granular loading */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
              {/* Website with granular loading */}
              <SkeletonOr
                loading={profileLoading.fields.website}
                skeleton={<SkeletonWebsite />}
              >
                {profileData.fields.website && (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-text-secondary" />
                    <a 
                      href={profileData.fields.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:text-accent-secondary transition-colors"
                    >
                      {profileData.fields.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </SkeletonOr>

              {/* Lightning address with granular loading */}
              <SkeletonOr
                loading={profileLoading.fields.lightningAddress}
                skeleton={<SkeletonLightningAddress />}
              >
                {profileData.fields.lightningAddress && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-bitcoin" />
                    <span className="text-bitcoin font-mono text-sm">
                      {profileData.fields.lightningAddress}
                    </span>
                  </div>
                )}
              </SkeletonOr>

              {/* NIP-05 verification with granular loading */}
              <SkeletonOr
                loading={profileLoading.fields.nip05}
                skeleton={<SkeletonNip05 />}
              >
                {profileData.fields.nip05 && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent-primary" />
                    <span className="text-accent-primary">
                      ✓ {profileData.fields.nip05}
                    </span>
                  </div>
                )}
              </SkeletonOr>

              {/* Profile join date - could be calculated from profile creation time */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-text-secondary" />
                <span className="text-text-secondary">
                  Joined Nostr
                </span>
              </div>
            </div>
            
            {/* Pubkey copy section */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={(e) => handleCopy(npubKey, 'npub', e)}
                className="group flex items-center gap-2 hover:bg-bg-active px-2 py-1 -mx-2 -my-1 rounded transition-all duration-200"
                title={`Copy ${npubKey}`}
              >
                <Shield className="w-4 h-4 text-text-secondary group-hover:text-accent-primary transition-colors" />
                <span className="font-mono text-sm text-text-secondary group-hover:text-accent-primary transition-colors">
                  {displayNpub}
                </span>
                {copiedField === 'npub' ? (
                  <Check className="w-4 h-4 text-accent-primary" />
                ) : (
                  <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 text-text-secondary group-hover:text-accent-primary transition-all duration-200" />
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {isOwnProfile ? (
                <Button
                  variant="secondary"
                size="lg"
                onClick={onEditProfile}
                className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
                </Button>
            ) : (
              <>
                {onMessage && (
                <Button
                  variant="ghost"
                    size="lg"
                  onClick={handleMessage}
                    className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Message</span>
                </Button>
                )}
                
                {(onFollow || onUnfollow) && (
                <Button
                    variant={isFollowing ? "secondary" : "primary"}
                    size="lg"
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                    className="flex items-center gap-2 min-w-[120px]"
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
                )}
              </>
            )}
            
            <Button
              variant="ghost"
              size="lg"
              className="p-2"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats row with granular loading */}
        <div className="flex items-center gap-8">
          {/* Following count */}
          <SkeletonOr
            loading={statsLoading}
            skeleton={<SkeletonFollowerCount />}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-text-primary">
                {followingCount?.toLocaleString() || '0'}
              </span>
              <span className="text-text-secondary">Following</span>
            </div>
          </SkeletonOr>

          {/* Followers count */}
          <SkeletonOr
            loading={statsLoading}
            skeleton={<SkeletonFollowerCount />}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-text-primary">
                {followerCount?.toLocaleString() || '0'}
              </span>
              <span className="text-text-secondary">Followers</span>
            </div>
          </SkeletonOr>

          {/* Posts count */}
          <SkeletonOr
            loading={statsLoading}
            skeleton={<SkeletonFollowerCount />}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-text-primary">
                {postCount?.toLocaleString() || '0'}
              </span>
              <span className="text-text-secondary">Posts</span>
            </div>
          </SkeletonOr>
        </div>
      </div>
    </div>
  )
})

export default ProfileHeader 