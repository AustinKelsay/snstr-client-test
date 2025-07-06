/**
 * @fileoverview PostCardSkeleton component for loading states
 * Provides skeleton loading animation for post cards while content loads
 * Matches the layout and dimensions of the actual PostCard component
 */

import React from 'react';
import { Skeleton, SkeletonText, SkeletonAvatar } from '@/components/common/Skeleton';
import { cn } from '@/utils/cn';

interface PostCardSkeletonProps {
  /** Custom CSS classes */
  className?: string;
  /** Whether to show interaction buttons skeleton */
  showInteractions?: boolean;
  /** Whether to show media placeholder */
  showMedia?: boolean;
  /** Variant for different post sizes */
  variant?: 'compact' | 'default' | 'expanded';
}

/**
 * PostCardSkeleton component displays loading animation for post cards
 * Mimics the structure of a real post with avatar, content, and interactions
 * 
 * @param className - Additional CSS classes
 * @param showInteractions - Whether to display interaction buttons skeleton
 * @param showMedia - Whether to show media content placeholder
 * @param variant - Size variant for different post layouts
 */
export function PostCardSkeleton({
  className,
  showInteractions = true,
  showMedia = false,
  variant = 'default',
}: PostCardSkeletonProps) {
  const isCompact = variant === 'compact';
  const isExpanded = variant === 'expanded';

  return (
    <div
      className={cn(
        // Match PostCard styling exactly
        'group relative bg-bg-secondary',
        'hover:bg-bg-hover transition-all duration-200',
        'w-full overflow-hidden',
        'border-b border-border-primary/20',
        // Variant-specific styling
        {
          'p-3': isCompact,
          'p-4': variant === 'default',
          'p-6': isExpanded,
        },
        className
      )}
      aria-label="Loading post..."
    >
      <div className="flex space-x-3">
        {/* Avatar skeleton */}
        <div className="flex-shrink-0">
          <SkeletonAvatar 
            size={isCompact ? 'sm' : 'md'} 
            className="flex-shrink-0"
          />
        </div>

        {/* Post content skeleton */}
        <div className="flex-1 min-w-0">
          {/* Header with username and timestamp */}
          <div className="flex items-center space-x-2 mb-2">
            <Skeleton 
              variant="text" 
              width="120px" 
              height="1.125rem" 
              className="flex-shrink-0"
            />
            <Skeleton 
              variant="text" 
              width="80px" 
              height="0.875rem" 
              className="flex-shrink-0"
            />
          </div>

          {/* Post content text */}
          <div className="mb-3">
            <SkeletonText 
              lines={isCompact ? 1 : isExpanded ? 4 : 2} 
              className="mb-1"
            />
            {isExpanded && (
              <SkeletonText 
                lines={2} 
                className="mt-2 opacity-80"
              />
            )}
          </div>

          {/* Media placeholder */}
          {showMedia && (
            <div className="mb-3">
              <Skeleton 
                variant="card"
                width="100%"
                height="200px"
                rounded
                className="bg-bg-quaternary"
              />
            </div>
          )}

          {/* Interaction buttons skeleton */}
          {showInteractions && (
            <div className="flex items-center space-x-6 mt-3">
              {/* Like button */}
              <div className="flex items-center space-x-2">
                <Skeleton 
                  variant="button"
                  width="20px"
                  height="20px"
                  className="rounded-full"
                />
                <Skeleton 
                  variant="text"
                  width="20px"
                  height="0.875rem"
                />
              </div>

              {/* Reply button */}
              <div className="flex items-center space-x-2">
                <Skeleton 
                  variant="button"
                  width="20px"
                  height="20px"
                  className="rounded-full"
                />
                <Skeleton 
                  variant="text"
                  width="20px"
                  height="0.875rem"
                />
              </div>

              {/* Repost button */}
              <div className="flex items-center space-x-2">
                <Skeleton 
                  variant="button"
                  width="20px"
                  height="20px"
                  className="rounded-full"
                />
                <Skeleton 
                  variant="text"
                  width="20px"
                  height="0.875rem"
                />
              </div>

              {/* Zap button */}
              <div className="flex items-center space-x-2">
                <Skeleton 
                  variant="button"
                  width="20px"
                  height="20px"
                  className="rounded-full"
                />
                <Skeleton 
                  variant="text"
                  width="30px"
                  height="0.875rem"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * PostListSkeleton component for displaying multiple loading post skeletons
 * Provides varied skeleton layouts for more natural loading appearance
 * 
 * @param count - Number of skeleton posts to display
 * @param className - Additional CSS classes
 */
export function PostListSkeleton({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const skeletonPosts = Array.from({ length: count }, (_, index) => {
    // Vary the skeleton appearance for more natural loading
    const showMedia = index % 4 === 0; // Show media on every 4th post
    const variant = index % 3 === 0 ? 'expanded' : 'default';
    
    return (
      <PostCardSkeleton
        key={index}
        showMedia={showMedia}
        variant={variant}
        className="last:border-b-0"
      />
    );
  });

  return (
    <div className={cn('space-y-0 divide-y divide-border-primary overflow-hidden', className)}>
      {skeletonPosts}
    </div>
  );
}

/**
 * ThreadPostSkeleton component for loading states in threaded conversations
 * Provides indented skeleton layout for reply threads
 * 
 * @param depth - Thread depth level for indentation
 * @param className - Additional CSS classes
 */
export function ThreadPostSkeleton({
  depth = 0,
  className,
}: {
  depth?: number;
  className?: string;
}) {
  const indentLevel = Math.min(depth, 3); // Max 3 levels of indentation
  const marginLeft = `${indentLevel * 1.5}rem`;

  return (
    <div 
      className={cn('border-l-2 border-border-primary', className)}
      style={{ marginLeft }}
    >
      <PostCardSkeleton 
        variant="compact"
        className="ml-4 border-b-0"
      />
    </div>
  );
} 