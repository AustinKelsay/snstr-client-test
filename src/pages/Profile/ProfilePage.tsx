/**
 * @fileoverview Profile page component for displaying user profiles
 * Shows user information, posts, and profile management
 */

import { useState } from 'react'
import { useAppSelector } from '@/store'
import { selectIsAuthenticated, selectUser } from '@/store/selectors/authSelectors'
import { ProfileHeader } from '@/components/profile'
import { PostList } from '@/components/post'
import type { UserProfile } from '@/types/auth'
import type { Post } from '@/types'

export interface ProfilePageProps {
  className?: string;
}

/**
 * Profile page component displays user profile information
 * Includes profile header, bio, follower stats, and user posts
 */
export function ProfilePage({ className }: ProfilePageProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectUser)
  
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts')
  const [userPosts] = useState<Post[]>([]) // TODO: Load user posts from store
  const [isLoadingPosts] = useState(false)
  const [postsError] = useState<string | null>(null)

  // Mock profile data for demonstration
  const mockProfile: UserProfile = {
    pubkey: user?.pubkey || 'not-connected',
    name: user?.name || 'Your Profile',
    display_name: user?.display_name || 'Your Profile',
    about: user?.about || 'Connect your Nostr extension to load your profile information',
    picture: user?.picture,
    banner: user?.banner,
    website: user?.website,
    nip05: user?.nip05,
    lud16: user?.lud16,
    lud06: user?.lud06,
  }

  // Handle edit profile click
  const handleEditProfile = () => {
    console.log('Edit profile clicked') // TODO: Implement profile editing
  }

  if (!isAuthenticated) {
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

  return (
    <div className={`min-h-screen ${className || ''}`}>
      {/* Profile Header */}
      <ProfileHeader
        profile={mockProfile}
        isOwnProfile={true}
        followerCount={0} // TODO: Get from contacts slice
        followingCount={0} // TODO: Get from contacts slice
        postCount={userPosts.length}
        onEditProfile={handleEditProfile}
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
            emptyMessage="No posts yet"
            emptyDescription="Start sharing your thoughts with the Nostr community!"
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
    </div>
  );
}

export default ProfilePage; 