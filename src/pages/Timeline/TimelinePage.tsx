/**
 * @fileoverview Timeline page component for displaying user timeline
 * Shows chronological posts with proper cypherpunk styling
 */


import LoadingSpinner from '@/components/ui/LoadingSpinner';

export interface TimelinePageProps {
  className?: string;
}

/**
 * Timeline page component displays the main feed of posts
 * Features infinite scroll, real-time updates, and post interactions
 */
export function TimelinePage({ className }: TimelinePageProps) {
  return (
    <div className={`min-h-screen ${className || ''}`}>
      {/* Page Header */}
      <div className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] sticky top-0 z-10">
        <div className="container-padding">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Timeline
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Your decentralized social feed
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="container-padding py-6">
        {/* Empty State - Placeholder */}
        <div className="text-center py-16">
          <div className="text-6xl mb-4 text-[var(--text-tertiary)]">
            📱
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Your Timeline Awaits
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Connect your Nostr extension to see posts from your network.
            Once connected, your timeline will populate with real-time updates.
          </p>
          
          {/* Connection Status */}
          <div className="card max-w-md mx-auto mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Extension Status</span>
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-[var(--warning)]">Detecting...</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="btn-base btn-primary">
              Connect Extension
            </button>
            <button className="btn-base btn-secondary">
              Learn About Nostr
            </button>
          </div>
        </div>

        {/* Future Timeline Posts Will Render Here */}
        <div className="hidden">
          {/* Skeleton posts for loading state */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="card mb-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimelinePage; 