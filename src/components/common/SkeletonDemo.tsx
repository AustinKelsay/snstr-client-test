/**
 * @fileoverview SkeletonDemo component showcasing all skeleton components
 * Provides examples and usage patterns for all skeleton loading states
 * Used for development, testing, and documentation purposes
 */

import React, { useState } from 'react';
import { cn } from '@/utils/cn';

// Import all skeleton components
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton 
} from './Skeleton';
import {
  MessageSkeleton,
  MessageListSkeleton,
  RelayStatusSkeleton,
  SearchResultSkeleton,
  StatsSkeleton,
  NavigationSkeleton,
  ComposerSkeleton
} from './DataSkeletons';
import {
  PostCardSkeleton,
  PostListSkeleton,
  ThreadPostSkeleton
} from '../post/PostCardSkeleton';
import {
  ProfileCardSkeleton,
  ProfileHeaderSkeleton,
  ProfileListSkeleton
} from '../profile/ProfileCardSkeleton';

interface SkeletonDemoProps {
  /** Custom CSS classes */
  className?: string;
}

/**
 * SkeletonDemo component demonstrates all available skeleton components
 * Useful for testing, documentation, and visual design verification
 * 
 * @param className - Additional CSS classes
 */
export function SkeletonDemo({ className }: SkeletonDemoProps) {
  const [activeSection, setActiveSection] = useState<string>('basic');

  const sections = [
    { id: 'basic', label: 'Basic Skeletons' },
    { id: 'posts', label: 'Post Skeletons' },
    { id: 'profiles', label: 'Profile Skeletons' },
    { id: 'messages', label: 'Message Skeletons' },
    { id: 'data', label: 'Data Skeletons' },
    { id: 'navigation', label: 'Navigation Skeletons' },
  ];

  return (
    <div className={cn('max-w-4xl mx-auto p-6', className)}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Skeleton Components Demo</h1>
        <p className="text-text-secondary">
          Comprehensive showcase of all available skeleton loading components
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 p-4 bg-bg-secondary rounded-lg">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeSection === section.id
                ? 'bg-accent-primary text-text-inverse'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            )}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Basic Skeletons */}
      {activeSection === 'basic' && (
        <div className="space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Basic Skeleton Components</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Text Skeletons</h3>
                <SkeletonText lines={1} className="mb-3" />
                <SkeletonText lines={3} />
              </div>

              <div>
                <h3 className="font-medium mb-3">Avatar Sizes</h3>
                <div className="flex items-center gap-4">
                  <SkeletonAvatar size="xs" />
                  <SkeletonAvatar size="sm" />
                  <SkeletonAvatar size="md" />
                  <SkeletonAvatar size="lg" />
                  <SkeletonAvatar size="xl" />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Button Skeletons</h3>
                <div className="flex items-center gap-3">
                  <SkeletonButton size="sm" />
                  <SkeletonButton size="md" />
                  <SkeletonButton size="lg" />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Custom Skeletons</h3>
                <Skeleton width="200px" height="40px" rounded className="mb-2" />
                <Skeleton width="100%" height="60px" variant="card" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Skeletons */}
      {activeSection === 'posts' && (
        <div className="space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Post Skeleton Components</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Post Card Variants</h3>
                <div className="space-y-4">
                  <PostCardSkeleton variant="compact" />
                  <PostCardSkeleton variant="default" />
                  <PostCardSkeleton variant="expanded" showMedia />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Thread Post Skeleton</h3>
                <div className="space-y-2">
                  <ThreadPostSkeleton depth={0} />
                  <ThreadPostSkeleton depth={1} />
                  <ThreadPostSkeleton depth={2} />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Post List Skeleton</h3>
                <PostListSkeleton count={3} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Skeletons */}
      {activeSection === 'profiles' && (
        <div className="space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Profile Skeleton Components</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Profile Card Variants</h3>
                <div className="space-y-4">
                  <ProfileCardSkeleton variant="compact" />
                  <ProfileCardSkeleton variant="default" />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Profile Header Skeleton</h3>
                <ProfileHeaderSkeleton />
              </div>

              <div>
                <h3 className="font-medium mb-3">Profile List Skeleton</h3>
                <ProfileListSkeleton count={3} variant="compact" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Skeletons */}
      {activeSection === 'messages' && (
        <div className="space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Message Skeleton Components</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Individual Messages</h3>
                <div className="space-y-3">
                  <MessageSkeleton isOwn={false} />
                  <MessageSkeleton isOwn={true} />
                  <MessageSkeleton isOwn={false} />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Message List</h3>
                <MessageListSkeleton count={5} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Skeletons */}
      {activeSection === 'data' && (
        <div className="space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Data Skeleton Components</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Relay Status</h3>
                <RelayStatusSkeleton />
              </div>

              <div>
                <h3 className="font-medium mb-3">Search Results</h3>
                <div className="space-y-2">
                  <SearchResultSkeleton type="user" />
                  <SearchResultSkeleton type="post" />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Statistics</h3>
                <StatsSkeleton columns={4} />
              </div>

              <div>
                <h3 className="font-medium mb-3">Composer</h3>
                <ComposerSkeleton />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Skeletons */}
      {activeSection === 'navigation' && (
        <div className="space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Navigation Skeleton Components</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Sidebar Navigation</h3>
                <NavigationSkeleton variant="sidebar" items={5} />
              </div>

              <div>
                <h3 className="font-medium mb-3">Tab Navigation</h3>
                <NavigationSkeleton variant="tabs" items={4} />
              </div>

              <div>
                <h3 className="font-medium mb-3">Mobile Navigation</h3>
                <NavigationSkeleton variant="mobile" items={5} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Guide */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold mb-4">Usage Guide</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium mb-2">Basic Implementation</h3>
            <pre className="bg-bg-tertiary p-3 rounded text-text-secondary overflow-x-auto">
{`// Simple skeleton usage
import { PostCardSkeleton } from '@/components';

function PostList() {
  const { posts, loading } = usePosts();
  
  if (loading) {
    return <PostListSkeleton count={5} />;
  }
  
  return posts.map(post => <PostCard key={post.id} post={post} />);
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium mb-2">Conditional Loading</h3>
            <pre className="bg-bg-tertiary p-3 rounded text-text-secondary overflow-x-auto">
{`// Conditional skeleton display
{loading ? (
  <ProfileCardSkeleton variant="header" />
) : (
  <ProfileCard profile={profile} />
)}`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium mb-2">List Skeletons</h3>
            <pre className="bg-bg-tertiary p-3 rounded text-text-secondary overflow-x-auto">
{`// Dynamic list skeleton
<PostListSkeleton 
  count={expectedItemCount} 
  className="space-y-2"
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonDemo; 