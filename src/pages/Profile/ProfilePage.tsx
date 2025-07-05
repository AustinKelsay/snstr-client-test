/**
 * @fileoverview Profile page component for displaying user profiles
 * Shows user information, posts, and profile management
 * Supports both current user profile and other users' profiles via URL parameters
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store'
import { selectIsAuthenticated, selectUser } from '@/store/selectors/authSelectors'
import { selectIsFollowing, selectIsUpdatingContacts } from '@/store/selectors/contactsSelectors'
import { selectUserPosts } from '@/store/selectors/postsSelectors'
import { followUser, unfollowUser } from '@/store/slices/contactsSlice'
import { loadUserPosts } from '@/store/slices/postsSlice'
import { ProfileHeader, ProfileEditModal } from '@/components/profile'
import { PostList } from '@/components/post'
import { useProfile } from '@/hooks/useProfile'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { createProfileNavigator } from '@/utils/navigation'
import type { UserProfile } from '@/types/auth'
import type { PublicKey } from '@/types'

export interface ProfilePageProps {
  className?: string;
}

/**
 * Profile page component displays user profile information
 * Includes profile header, bio, follower stats, and user posts
 * Supports both current user profile (/profile) and other users (/profile/:pubkey)
 */
export function ProfilePage({ className }: ProfilePageProps) {
  const { pubkey: urlPubkey } = useParams<{ pubkey: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const currentUser = useAppSelector(selectUser)
  
  // Determine which profile to show
  const targetPubkey = urlPubkey || currentUser?.pubkey
  const isOwnProfile = !urlPubkey || (currentUser?.pubkey === urlPubkey)
  
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // Get user posts from store
  const userPosts = useAppSelector(state => 
    targetPubkey ? selectUserPosts(state, targetPubkey) : []
  )
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [postsError] = useState<string | null>(null)

  // Get profile data for the target user
  const { profile, isLoading: isProfileLoading } = useProfile(targetPubkey || null, {
    autoFetch: true,
    subscribe: true
  })

  // Get follow state for this profile
  const isFollowing = useAppSelector(state => 
    targetPubkey && profile?.pubkey && !isOwnProfile 
      ? selectIsFollowing(state, profile.pubkey) 
      : false
  )
  const isFollowLoading = useAppSelector(selectIsUpdatingContacts)

  // Redirect to login if trying to access own profile without authentication
  useEffect(() => {
    if (!urlPubkey && !isAuthenticated) {
      // This is trying to access /profile without being authenticated
      // Show authentication prompt instead of redirecting
      return
    }
  }, [urlPubkey, isAuthenticated])

  // Use profile data with fallbacks
  const displayProfile: UserProfile = {
    pubkey: targetPubkey || 'not-found',
    name: profile?.name || (isOwnProfile ? currentUser?.name : undefined) || `${(targetPubkey || '').slice(0, 8)}...${(targetPubkey || '').slice(-4)}`,
    display_name: profile?.display_name || (isOwnProfile ? currentUser?.display_name : undefined) || profile?.name || (isOwnProfile ? currentUser?.name : undefined) || 'User',
    about: profile?.about || (isOwnProfile ? currentUser?.about : undefined) || (isOwnProfile ? 'Connect your Nostr extension to load your profile information' : 'This user has not set up their profile yet'),
    picture: profile?.picture || (isOwnProfile ? currentUser?.picture : undefined),
    banner: profile?.banner || (isOwnProfile ? currentUser?.banner : undefined),
    website: profile?.website || (isOwnProfile ? currentUser?.website : undefined),
    nip05: profile?.nip05 || (isOwnProfile ? currentUser?.nip05 : undefined),
    lud16: profile?.lud16 || (isOwnProfile ? currentUser?.lud16 : undefined),
    lud06: profile?.lud06 || (isOwnProfile ? currentUser?.lud06 : undefined),
  }

  // Handle profile navigation
  const handleAuthorClick = createProfileNavigator(navigate, currentUser?.pubkey)

  // Handle edit profile click
  const handleEditProfile = () => {
    setIsEditModalOpen(true)
  }

  // Handle profile edit success
  const handleEditSuccess = (updatedProfile: UserProfile) => {
    console.log('Profile updated successfully:', updatedProfile)
    // Profile will be updated via Redux store automatically
  }

  // Handle follow user
  const handleFollow = (pubkey: PublicKey) => {
    dispatch(followUser({ pubkey }))
  }

  // Handle unfollow user
  const handleUnfollow = (pubkey: PublicKey) => {
    dispatch(unfollowUser(pubkey))
  }

  // Load user posts when component mounts or user changes
  useEffect(() => {
    if (targetPubkey) {
      setIsLoadingPosts(true)
      dispatch(loadUserPosts({ pubkey: targetPubkey }))
        .finally(() => setIsLoadingPosts(false))
    }
  }, [dispatch, targetPubkey])

  // Show loading state while profile is loading
  if (isProfileLoading && !profile) {
    return (
      <div className={`min-h-screen ${className || ''}`}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  // Show not authenticated state for /profile route
  if (!urlPubkey && !isAuthenticated) {
    return (
      <div className={`min-h-screen ${className || ''}`}>
        {/* Page Header */}
        <div className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] sticky top-0 z-10">
          <div className="container-padding">
            <div className="py-4">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Profile
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Your Nostr identity
              </p>
            </div>
          </div>
        </div>

        {/* Not authenticated state */}
        <div className="text-center py-16">
          <div className="text-6xl mb-4 text-[var(--text-tertiary)]">
            🔐
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Connect to view your profile
          </h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Connect your Nostr extension to view and manage your profile information.
          </p>
          
          <button className="btn-base btn-primary">
            Connect Extension
          </button>
        </div>
      </div>
    )
  }

  // Show not found state if profile doesn't exist
  if (!targetPubkey) {
    return (
      <div className={`min-h-screen ${className || ''}`}>
        <EmptyState
          title="Profile not found"
          description="The requested profile could not be found."
          className="py-16"
        />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${className || ''}`}>
      {/* Profile Header */}
      <ProfileHeader
        profile={displayProfile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        isFollowLoading={isFollowLoading}
        followerCount={0} // TODO: Get from contacts slice
        followingCount={0} // TODO: Get from contacts slice
        postCount={userPosts.length}
        onEditProfile={handleEditProfile}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
      />

      {/* Profile Tabs */}
      <div className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] sticky top-0 z-10">
        <div className="container-padding">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'posts' 
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Posts
            </button>
            <button 
              onClick={() => setActiveTab('replies')}
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'replies' 
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Replies
            </button>
            <button 
              onClick={() => setActiveTab('media')}
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'media' 
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Media
            </button>
            <button 
              onClick={() => setActiveTab('likes')}
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'likes' 
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Likes
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container-padding py-6">
        {activeTab === 'posts' && (
          <PostList
            posts={userPosts}
            isLoading={isLoadingPosts}
            error={postsError}
            hasMore={false}
            onAuthorClick={handleAuthorClick}
            emptyMessage={isOwnProfile ? "No posts yet" : "No posts from this user"}
            emptyDescription={isOwnProfile ? "Start sharing your thoughts with the Nostr community!" : "This user hasn't posted anything yet."}
          />
        )}
        
        {activeTab !== 'posts' && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 text-[var(--text-tertiary)]">
              🚧
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Coming Soon
            </h3>
            <p className="text-[var(--text-secondary)]">
              {activeTab === 'replies' && 'Reply tracking will be available soon.'}
              {activeTab === 'media' && 'Media posts will be displayed here.'}
              {activeTab === 'likes' && 'Liked posts will be shown here.'}
            </p>
          </div>
        )}
      </div>

      {/* Profile Edit Modal - only show for own profile */}
      {isAuthenticated && isOwnProfile && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          profile={displayProfile}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

export default ProfilePage; 