/**
 * @fileoverview Additional skeleton components for various data components
 * Provides skeleton loading states for messages, relay status, search results, etc.
 * Follows the cypherpunk theme and consistent loading patterns
 */

import React from 'react';
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonButton } from '@/components/common/Skeleton';
import { cn } from '@/utils/cn';

/**
 * MessageSkeleton component for loading direct messages
 * Provides skeleton animation for message bubbles in conversations
 * 
 * @param isOwn - Whether this is the user's own message
 * @param index - Optional index for deterministic line count (prevents SSR hydration mismatches)
 * @param className - Additional CSS classes
 */
export function MessageSkeleton({
  isOwn = false,
  index,
  className,
}: {
  isOwn?: boolean;
  index?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-start space-x-3 mb-4',
        isOwn ? 'flex-row-reverse space-x-reverse' : '',
        className
      )}
      aria-label="Loading message..."
    >
      {/* Avatar skeleton */}
      <div className="flex-shrink-0">
        <SkeletonAvatar size="sm" />
      </div>

      {/* Message content skeleton */}
      <div className={cn('flex-1 max-w-xs', isOwn ? 'items-end' : 'items-start')}>
        {/* Message bubble */}
        <div
          className={cn(
            'px-4 py-2 rounded-lg',
            isOwn 
              ? 'bg-accent-primary/10 ml-auto' 
              : 'bg-bg-tertiary mr-auto'
          )}
        >
          <SkeletonText 
            lines={index !== undefined ? ((index % 3) + 1) : 2} 
            className="min-w-20"
          />
        </div>

        {/* Timestamp skeleton */}
        <div className={cn('mt-1', isOwn ? 'text-right' : 'text-left')}>
          <Skeleton 
            variant="text"
            width="60px"
            height="0.75rem"
            className="opacity-60"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * MessageListSkeleton component for loading conversation history
 * Provides varied message skeletons for more natural loading appearance
 * 
 * @param count - Number of message skeletons to display
 * @param className - Additional CSS classes
 */
export function MessageListSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const messageSkeletons = Array.from({ length: count }, (_, index) => {
    // Alternate between own and other messages
    const isOwn = index % 3 === 0;
    
    return (
      <MessageSkeleton
        key={index}
        isOwn={isOwn}
        index={index}
      />
    );
  });

  return (
    <div className={cn('space-y-0', className)}>
      {messageSkeletons}
    </div>
  );
}

/**
 * RelayStatusSkeleton component for loading relay connection status
 * Provides skeleton for relay cards in settings or status displays
 * 
 * @param className - Additional CSS classes
 */
export function RelayStatusSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 card',
        className
      )}
      aria-label="Loading relay status..."
    >
      {/* Relay info skeleton */}
      <div className="flex items-center space-x-3 flex-1">
        {/* Status indicator */}
        <Skeleton 
          variant="button"
          width="12px"
          height="12px"
          className="rounded-full"
        />
        
        {/* Relay URL and info */}
        <div className="flex-1 min-w-0">
          <Skeleton 
            variant="text"
            width="200px"
            height="1rem"
            className="mb-1"
          />
          <Skeleton 
            variant="text"
            width="150px"
            height="0.875rem"
            className="opacity-80"
          />
        </div>
      </div>

      {/* Connection stats skeleton */}
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <Skeleton 
            variant="text"
            width="30px"
            height="1rem"
            className="mb-1"
          />
          <Skeleton 
            variant="text"
            width="40px"
            height="0.75rem"
            className="opacity-60"
          />
        </div>
        
        <div className="text-center">
          <Skeleton 
            variant="text"
            width="30px"
            height="1rem"
            className="mb-1"
          />
          <Skeleton 
            variant="text"
            width="40px"
            height="0.75rem"
            className="opacity-60"
          />
        </div>

        {/* Remove button */}
        <SkeletonButton 
          size="sm"
          className="w-16"
        />
      </div>
    </div>
  );
}

/**
 * RelayListSkeleton component for loading multiple relay statuses
 * Provides skeleton for relay management interface
 * 
 * @param count - Number of relay skeletons to display
 * @param className - Additional CSS classes
 */
export function RelayListSkeleton({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const relaySkeletons = Array.from({ length: count }, (_, index) => (
    <RelayStatusSkeleton
      key={index}
      className="border-b border-border-primary last:border-b-0"
    />
  ));

  return (
    <div className={cn('space-y-0', className)}>
      {relaySkeletons}
    </div>
  );
}

/**
 * SearchResultSkeleton component for loading search results
 * Provides skeleton for user/content search results
 * 
 * @param type - Type of search result (user or post)
 * @param className - Additional CSS classes
 */
export function SearchResultSkeleton({
  type = 'user',
  className,
}: {
  type?: 'user' | 'post';
  className?: string;
}) {
  if (type === 'post') {
    return (
      <div
        className={cn(
          'flex items-start space-x-3 p-4 border-b border-border-primary',
          className
        )}
        aria-label="Loading search result..."
      >
        <SkeletonAvatar size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Skeleton width="100px" height="1rem" />
            <Skeleton width="60px" height="0.875rem" className="opacity-80" />
          </div>
          <SkeletonText lines={2} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center space-x-3 p-4 border-b border-border-primary',
        className
      )}
      aria-label="Loading search result..."
    >
      <SkeletonAvatar size="md" />
      <div className="flex-1 min-w-0">
        <Skeleton width="150px" height="1.125rem" className="mb-1" />
        <Skeleton width="120px" height="1rem" className="opacity-80 mb-2" />
        <SkeletonText lines={1} />
      </div>
      <SkeletonButton size="sm" className="w-20" />
    </div>
  );
}

/**
 * SearchResultsListSkeleton component for loading search results list
 * Provides mixed skeleton results for search interface
 * 
 * @param count - Number of search result skeletons
 * @param type - Type of search results
 * @param className - Additional CSS classes
 */
export function SearchResultsListSkeleton({
  count = 6,
  type = 'user',
  className,
}: {
  count?: number;
  type?: 'user' | 'post' | 'mixed';
  className?: string;
}) {
  const searchResultSkeletons = Array.from({ length: count }, (_, index) => {
    const resultType = type === 'mixed' 
      ? (index % 3 === 0 ? 'post' : 'user') 
      : type;
    
    return (
      <SearchResultSkeleton
        key={index}
        type={resultType}
        className="last:border-b-0"
      />
    );
  });

  return (
    <div className={cn('space-y-0', className)}>
      {searchResultSkeletons}
    </div>
  );
}

/**
 * StatsSkeleton component for loading statistics displays
 * Provides skeleton for dashboard stats, metrics, etc.
 * 
 * @param columns - Number of stat columns to display
 * @param className - Additional CSS classes
 */
export function StatsSkeleton({
  columns = 4,
  className,
}: {
  columns?: number;
  className?: string;
}) {
  const statSkeletons = Array.from({ length: columns }, (_, index) => (
    <div key={index} className="flex-1 text-center">
      <Skeleton 
        variant="text"
        width="50px"
        height="2rem"
        className="mb-2 mx-auto"
      />
      <Skeleton 
        variant="text"
        width="80px"
        height="1rem"
        className="opacity-80 mx-auto"
      />
    </div>
  ));

  return (
    <div className={cn('flex items-center space-x-6', className)}>
      {statSkeletons}
    </div>
  );
}

/**
 * NavigationSkeleton component for loading navigation items
 * Provides skeleton for sidebar or mobile navigation
 * 
 * @param items - Number of navigation items
 * @param variant - Navigation style variant
 * @param className - Additional CSS classes
 */
export function NavigationSkeleton({
  items = 5,
  variant = 'sidebar',
  className,
}: {
  items?: number;
  variant?: 'sidebar' | 'mobile' | 'tabs';
  className?: string;
}) {
  const navSkeletons = Array.from({ length: items }, (_, index) => (
    <div 
      key={index} 
      className={cn(
        'flex items-center space-x-3 p-3',
        variant === 'tabs' ? 'flex-1 justify-center' : '',
        className
      )}
    >
      <Skeleton 
        variant="button"
        width="20px"
        height="20px"
        className="rounded-sm"
      />
      {variant !== 'mobile' && (
        <Skeleton 
          variant="text"
          width="100px"
          height="1rem"
        />
      )}
    </div>
  ));

  return (
    <div className={cn(
      variant === 'tabs' ? 'flex border-b border-border-primary' : 'space-y-1',
      className
    )}>
      {navSkeletons}
    </div>
  );
}

/**
 * ComposerSkeleton component for loading post composer
 * Provides skeleton for the post creation interface
 * 
 * @param className - Additional CSS classes
 */
export function ComposerSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn('card p-4', className)}
      aria-label="Loading composer..."
    >
      <div className="flex space-x-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1">
          <Skeleton 
            variant="card"
            width="100%"
            height="120px"
            className="mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SkeletonButton size="sm" className="w-8 h-8 rounded-full" />
              <SkeletonButton size="sm" className="w-8 h-8 rounded-full" />
              <SkeletonButton size="sm" className="w-8 h-8 rounded-full" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton width="40px" height="1rem" className="opacity-60" />
              <SkeletonButton size="md" className="w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 