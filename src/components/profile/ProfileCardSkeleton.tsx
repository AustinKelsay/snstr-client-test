/**
 * @fileoverview ProfileCardSkeleton component for loading states
 * Provides skeleton loading animation for profile cards while content loads
 * Matches the layout and dimensions of the actual ProfileCard component
 */

import React from 'react';
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonButton } from '@/components/common/Skeleton';
import { cn } from '@/utils/cn';

interface ProfileCardSkeletonProps {
  /** Custom CSS classes */
  className?: string;
  /** Whether to show follow button skeleton */
  showFollowButton?: boolean;
  /** Whether to show follower stats */
  showStats?: boolean;
  /** Variant for different profile card sizes */
  variant?: 'compact' | 'default' | 'header';
}

/**
 * ProfileCardSkeleton component displays loading animation for profile cards
 * Mimics the structure of a real profile with avatar, name, bio, and stats
 * 
 * @param className - Additional CSS classes
 * @param showFollowButton - Whether to display follow button skeleton
 * @param showStats - Whether to show follower/following stats
 * @param variant - Size variant for different profile layouts
 */
export function ProfileCardSkeleton({
  className,
  showFollowButton = true,
  showStats = true,
  variant = 'default',
}: ProfileCardSkeletonProps) {
  const isCompact = variant === 'compact';
  const isHeader = variant === 'header';

  return (
    <div
      className={cn(
        // Base card styles
        'card',
        // Variant-specific styling
        {
          'p-3': isCompact,
          'p-4': variant === 'default',
          'p-6': isHeader,
        },
        className
      )}
      aria-label="Loading profile..."
    >
      <div className="flex items-start space-x-4">
        {/* Avatar skeleton */}
        <div className="flex-shrink-0">
          <SkeletonAvatar 
            size={isCompact ? 'sm' : isHeader ? 'xl' : 'lg'} 
            className="flex-shrink-0"
          />
        </div>

        {/* Profile content skeleton */}
        <div className="flex-1 min-w-0">
          {/* Header section */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              {/* Display name */}
              <Skeleton 
                variant="text" 
                width="150px" 
                height={isHeader ? "1.5rem" : "1.25rem"}
                className="mb-1"
              />
              
              {/* Username/NIP-05 */}
              <Skeleton 
                variant="text" 
                width="120px" 
                height="1rem" 
                className="opacity-80"
              />
            </div>

            {/* Follow button */}
            {showFollowButton && !isCompact && (
              <div className="flex-shrink-0 ml-4">
                <SkeletonButton 
                  size={isHeader ? 'lg' : 'md'}
                  className="w-24"
                />
              </div>
            )}
          </div>

          {/* Bio section */}
          {!isCompact && (
            <div className="mb-3">
              <SkeletonText 
                lines={isHeader ? 3 : 2} 
                className="mb-1"
              />
            </div>
          )}

          {/* Stats section */}
          {showStats && (
            <div className="flex items-center space-x-6">
              {/* Following count */}
              <div className="flex items-center space-x-2">
                <Skeleton 
                  variant="text"
                  width="30px"
                  height="1rem"
                  className="font-medium"
                />
                <Skeleton 
                  variant="text"
                  width="60px"
                  height="0.875rem"
                  className="opacity-80"
                />
              </div>

              {/* Followers count */}
              <div className="flex items-center space-x-2">
                <Skeleton 
                  variant="text"
                  width="30px"
                  height="1rem"
                  className="font-medium"
                />
                <Skeleton 
                  variant="text"
                  width="60px"
                  height="0.875rem"
                  className="opacity-80"
                />
              </div>

              {/* NIP-05 verification badge */}
              <div className="flex items-center space-x-1">
                <Skeleton 
                  variant="button"
                  width="16px"
                  height="16px"
                  className="rounded-full"
                />
                <Skeleton 
                  variant="text"
                  width="40px"
                  height="0.875rem"
                  className="opacity-80"
                />
              </div>
            </div>
          )}

          {/* Compact follow button */}
          {showFollowButton && isCompact && (
            <div className="mt-3">
              <SkeletonButton 
                size="sm"
                className="w-20"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ProfileHeaderSkeleton component for profile page headers
 * Provides skeleton for large profile headers with banner and detailed info
 * 
 * @param className - Additional CSS classes
 */
export function ProfileHeaderSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      {/* Banner skeleton */}
      <div className="relative">
        <Skeleton 
          variant="card"
          width="100%"
          height="200px"
          className="rounded-t-lg"
        />
        
        {/* Profile avatar overlaid on banner */}
        <div className="absolute -bottom-12 left-6">
          <SkeletonAvatar 
            size="xl"
            className="ring-4 ring-bg-primary"
          />
        </div>
      </div>

      {/* Profile info section */}
      <div className="pt-16 px-6 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Display name */}
            <Skeleton 
              variant="text" 
              width="200px" 
              height="2rem"
              className="mb-2"
            />
            
            {/* Username */}
            <Skeleton 
              variant="text" 
              width="150px" 
              height="1.25rem" 
              className="mb-3 opacity-80"
            />

            {/* Bio */}
            <div className="mb-4">
              <SkeletonText 
                lines={3} 
                className="max-w-md"
              />
            </div>

            {/* Additional info (website, location, etc.) */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <Skeleton 
                  variant="button"
                  width="16px"
                  height="16px"
                  className="rounded-full"
                />
                <Skeleton 
                  variant="text"
                  width="100px"
                  height="0.875rem"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Skeleton 
                  variant="button"
                  width="16px"
                  height="16px"
                  className="rounded-full"
                />
                <Skeleton 
                  variant="text"
                  width="80px"
                  height="0.875rem"
                />
              </div>
            </div>
          </div>

          {/* Follow button */}
          <div className="flex-shrink-0">
            <SkeletonButton 
              size="lg"
              className="w-32"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Skeleton 
              variant="text"
              width="40px"
              height="1.25rem"
              className="font-semibold"
            />
            <Skeleton 
              variant="text"
              width="70px"
              height="1rem"
              className="opacity-80"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Skeleton 
              variant="text"
              width="40px"
              height="1.25rem"
              className="font-semibold"
            />
            <Skeleton 
              variant="text"
              width="70px"
              height="1rem"
              className="opacity-80"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Skeleton 
              variant="button"
              width="20px"
              height="20px"
              className="rounded-full"
            />
            <Skeleton 
              variant="text"
              width="60px"
              height="1rem"
              className="opacity-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ProfileListSkeleton component for displaying multiple loading profile skeletons
 * Provides varied skeleton layouts for profile lists or search results
 * 
 * @param count - Number of skeleton profiles to display
 * @param variant - Profile card variant
 * @param className - Additional CSS classes
 */
export function ProfileListSkeleton({
  count = 5,
  variant = 'default',
  className,
}: {
  count?: number;
  variant?: 'compact' | 'default';
  className?: string;
}) {
  const skeletonProfiles = Array.from({ length: count }, (_, index) => (
    <ProfileCardSkeleton
      key={index}
      variant={variant}
      className="border-b border-border-primary last:border-b-0"
    />
  ));

  return (
    <div className={cn('space-y-0', className)}>
      {skeletonProfiles}
    </div>
  );
} 