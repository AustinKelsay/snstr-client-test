/**
 * @fileoverview Profile page component for displaying user profiles
 * Shows user information, posts, and profile management
 */


import LoadingSpinner from '@/components/ui/LoadingSpinner';

export interface ProfilePageProps {
  className?: string;
}

/**
 * Profile page component displays user profile information
 * Includes profile header, bio, follower stats, and user posts
 */
export function ProfilePage({ className }: ProfilePageProps) {
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

      {/* Profile Content */}
      <div className="container-padding py-6">
        {/* Profile Header Placeholder */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar Placeholder */}
            <div className="w-20 h-20 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center">
              <span className="text-2xl text-[var(--text-tertiary)]">👤</span>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Your Profile
                </h2>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]"></div>
                  <span className="text-sm text-[var(--text-secondary)]">Not connected</span>
                </div>
              </div>
              
              <p className="text-[var(--text-secondary)] mb-3">
                Connect your Nostr extension to load your profile information
              </p>
              
              {/* Stats Placeholder */}
              <div className="flex items-center gap-6 text-sm">
                <span className="text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">--</span> Following
                </span>
                <span className="text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">--</span> Followers
                </span>
                <span className="text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">--</span> Posts
                </span>
              </div>
            </div>
            
            {/* Action Button */}
            <button className="btn-base btn-secondary">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="border-b border-[var(--border-primary)] mb-6">
          <div className="flex items-center gap-8">
            <button className="py-3 border-b-2 border-[var(--accent-primary)] text-[var(--accent-primary)] font-medium">
              Posts
            </button>
            <button className="py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              Replies
            </button>
            <button className="py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              Media
            </button>
            <button className="py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              Likes
            </button>
          </div>
        </div>

        {/* Profile Posts - Empty State */}
        <div className="text-center py-16">
          <div className="text-6xl mb-4 text-[var(--text-tertiary)]">
            📝
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            No posts yet
          </h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Once you connect your extension, your posts will appear here.
            Start sharing your thoughts with the Nostr community!
          </p>
          
          {/* Connection Status */}
          <div className="card max-w-md mx-auto mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Public Key</span>
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-[var(--warning)]">Not available</span>
              </div>
            </div>
          </div>

          <button className="btn-base btn-primary">
            Connect Extension
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage; 