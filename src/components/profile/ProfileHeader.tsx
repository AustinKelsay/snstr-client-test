/**
 * @fileoverview ProfileHeader component for displaying user profile headers
 * Shows avatar, name, bio, verification status, follower counts, and action buttons
 * Supports both current user and other user profiles with appropriate action states
 */

import { memo, useCallback, useState } from 'react'
import { Settings, UserPlus, UserMinus, MessageCircle, MoreHorizontal, CheckCircle, Link as LinkIcon, Calendar, Zap, Globe, Shield, Copy, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { PublicKey } from '@/types'
import type { UserProfile } from '@/types/auth'
import Button from '@/components/ui/Button'
import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/utils/cn'
import { pubkeyToNpub, formatNip19ForDisplay } from '@/utils/nip19'

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
  
  // State for copy functionality
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Format display name
  const displayName = profile.display_name || profile.name || `${profile.pubkey.slice(0, 8)}...${profile.pubkey.slice(-4)}`
  const username = profile.name || `${profile.pubkey.slice(0, 8)}...${profile.pubkey.slice(-4)}`

  // Generate NIP-19 identifiers for display
  const npubKey = pubkeyToNpub(profile.pubkey)
  const displayNpub = formatNip19ForDisplay(npubKey, { startChars: 8, endChars: 6, showPrefix: false })

  // Copy to clipboard functionality
  const handleCopy = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [])

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
    <div className={cn('relative bg-bg-secondary border-b border-border-primary overflow-hidden', className)}>
      {/* Banner with cyberpunk gradient */}
      <div 
        className={cn(
          'h-48 sm:h-64 relative',
          profile.banner ? '' : 'bg-gradient-to-br from-bg-primary via-bg-tertiary to-bg-quaternary'
        )}
        style={{
          backgroundImage: profile.banner ? `url(${profile.banner})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Matrix-style overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/20 to-bg-secondary/80" />
        
        {/* Cyberpunk grid effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(0,255,65,0.03)_25px,rgba(0,255,65,0.03)_26px,transparent_27px,transparent_74px,rgba(0,255,65,0.03)_75px,rgba(0,255,65,0.03)_76px,transparent_77px,transparent_99px)] bg-[length:100px_100px]" />
        </div>
        

      </div>

      {/* Profile content */}
      <div className="relative px-4 sm:px-6 pb-6">
        {/* Avatar and action buttons */}
        <div className="flex items-start justify-between -mt-16 sm:-mt-20 mb-6">
          <div className="relative group">
            {/* Avatar with glow effect */}
          <div className="relative">
              <div className="absolute inset-0 bg-accent-primary/20 rounded-full blur-lg group-hover:bg-accent-primary/40 transition-all duration-300" />
              <div className="relative border-4 border-bg-secondary rounded-full">
              <Avatar
                src={profile.picture}
                name={displayName}
                pubkey={profile.pubkey}
                size="xl"
                  className="w-24 h-24 sm:w-32 sm:h-32 ring-2 ring-accent-primary/30 group-hover:ring-accent-primary/60 transition-all duration-300"
              />
              </div>
            </div>
            
            {/* Status indicators */}
            <div className="absolute -bottom-2 -right-2 flex gap-1">
              {profile.nip05 && (
                <div className="w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-bg-primary" />
                </div>
              )}
              {(profile.lud16 || profile.lud06) && (
                <div className="w-6 h-6 bg-bitcoin rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-bg-primary" />
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4">
            {isOwnProfile ? (
                <Button
                  variant="secondary"
                size="md"
                  onClick={handleEditProfile}
                className="flex items-center gap-2 font-mono"
                >
                  <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">EDIT PROFILE</span>
                </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMessage}
                  className="p-3 font-mono"
                  title="Send message"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-3 font-mono"
                  title="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>

                <Button
                  variant={isFollowing ? "outline" : "primary"}
                  size="md"
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className="flex items-center gap-2 min-w-[100px] font-mono"
                >
                  {isFollowLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      <span>UNFOLLOW</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>FOLLOW</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Profile info */}
        <div className="space-y-4">
          {/* Names and verification */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-mono tracking-wide">
                {displayName}
              </h1>
              {profile.nip05 && (
                <div className="flex items-center gap-1 bg-accent-primary/10 px-2 py-1 rounded border border-accent-primary/30">
                  <Shield className="w-4 h-4 text-accent-primary" />
                  <span className="text-xs font-mono text-accent-primary">VERIFIED</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="font-mono text-sm">@{username}</span>
              <span className="text-text-quaternary">•</span>
              <button
                onClick={() => handleCopy(npubKey, 'npub')}
                className="group flex items-center gap-1 hover:bg-bg-active px-2 py-1 -mx-2 -my-1 rounded transition-all duration-200"
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
            
            {profile.nip05 && (
              <div className="flex items-center gap-2 text-accent-primary text-sm font-mono">
                <Globe className="w-4 h-4" />
                <span>{profile.nip05}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.about && (
            <div className="max-w-2xl">
              <p className="text-text-primary leading-relaxed whitespace-pre-wrap text-base">
                {profile.about}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {/* Website */}
            {profile.website && (
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors font-mono group"
              >
                <LinkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="border-b border-transparent group-hover:border-accent-primary">
                  {profile.website.replace(/^https?:\/\//, '')}
                </span>
              </a>
            )}

            {/* Join date */}
            <div className="flex items-center gap-2 text-text-secondary font-mono">
              <Calendar className="w-4 h-4" />
              <span>JOINED {joinDateStr.toUpperCase()}</span>
            </div>

            {/* Lightning address */}
            {(profile.lud16 || profile.lud06) && (
              <div className="flex items-center gap-2 text-bitcoin font-mono bg-bitcoin/10 px-2 py-1 rounded border border-bitcoin/30">
                <Zap className="w-4 h-4" />
                <span className="text-xs">{profile.lud16 || 'LIGHTNING ENABLED'}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-sm group cursor-pointer">
              <span className="font-bold text-text-primary font-mono text-lg group-hover:text-accent-primary transition-colors">
                {postCount.toLocaleString()}
              </span>
              <span className="text-text-secondary font-mono text-xs tracking-wide">POSTS</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm group cursor-pointer">
              <span className="font-bold text-text-primary font-mono text-lg group-hover:text-accent-primary transition-colors">
                {followingCount.toLocaleString()}
              </span>
              <span className="text-text-secondary font-mono text-xs tracking-wide">FOLLOWING</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm group cursor-pointer">
              <span className="font-bold text-text-primary font-mono text-lg group-hover:text-accent-primary transition-colors">
                {followerCount.toLocaleString()}
              </span>
              <span className="text-text-secondary font-mono text-xs tracking-wide">FOLLOWERS</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-primary to-transparent" />
    </div>
  )
})

export default ProfileHeader 