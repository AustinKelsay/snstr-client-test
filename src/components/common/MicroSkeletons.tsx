/**
 * @fileoverview Micro-skeleton components for granular field-level loading states
 * Provides tiny skeleton elements that can replace individual pieces of data
 * Enables skeleton loading at the field level rather than entire component level
 */

import React from 'react'
import { Skeleton, SkeletonText, SkeletonAvatar } from './Skeleton'
import { cn } from '@/utils/cn'

// =============================================================================
// NAME & TEXT MICRO-SKELETONS
// =============================================================================

interface SkeletonNameProps {
  /** Name length variant */
  variant?: 'short' | 'medium' | 'long'
  /** Additional CSS classes */
  className?: string
}

/**
 * SkeletonName - Micro-skeleton for user display names
 * Provides realistic width variations for different name lengths
 */
export function SkeletonName({ variant = 'medium', className }: SkeletonNameProps) {
  const widths = {
    short: '80px',
    medium: '120px', 
    long: '160px'
  }

  return (
    <Skeleton 
      width={widths[variant]}
      height="1.125rem"
      className={cn('inline-block', className)}
      aria-label="Loading name..."
    />
  )
}

/**
 * SkeletonUsername - Micro-skeleton for usernames
 */
export function SkeletonUsername({ className }: { className?: string }) {
  return (
    <Skeleton 
      width="100px"
      height="1rem"
      className={cn('inline-block opacity-80', className)}
      aria-label="Loading username..."
    />
  )
}

/**
 * SkeletonNip05 - Micro-skeleton for NIP-05 verification identifiers
 */
export function SkeletonNip05({ className }: { className?: string }) {
  return (
    <Skeleton 
      width="140px"
      height="0.875rem"
      className={cn('inline-block', className)}
      aria-label="Loading verification..."
    />
  )
}

/**
 * SkeletonBio - Micro-skeleton for bio/about text
 */
export function SkeletonBio({ 
  lines = 2, 
  className 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <SkeletonText 
      lines={lines}
      className={cn('opacity-90', className)}
      aria-label="Loading bio..."
    />
  )
}

// =============================================================================
// TIMESTAMP & METADATA MICRO-SKELETONS  
// =============================================================================

/**
 * SkeletonTimestamp - Micro-skeleton for timestamps
 */
export function SkeletonTimestamp({ className }: { className?: string }) {
  return (
    <Skeleton 
      width="60px"
      height="0.875rem"
      className={cn('inline-block font-mono', className)}
      aria-label="Loading timestamp..."
    />
  )
}

/**
 * SkeletonNoteId - Micro-skeleton for note identifiers
 */
export function SkeletonNoteId({ className }: { className?: string }) {
  return (
    <Skeleton 
      width="80px"
      height="0.75rem"
      className={cn('inline-block font-mono opacity-60', className)}
      aria-label="Loading note ID..."
    />
  )
}

/**
 * SkeletonRelayUrl - Micro-skeleton for relay URLs
 */
export function SkeletonRelayUrl({ className }: { className?: string }) {
  return (
    <Skeleton 
      width="120px"
      height="0.875rem"
      className={cn('inline-block font-mono', className)}
      aria-label="Loading relay..."
    />
  )
}

// =============================================================================
// INTERACTION & COUNT MICRO-SKELETONS
// =============================================================================

interface SkeletonCountProps {
  /** Icon size variant */
  iconSize?: 'sm' | 'md' | 'lg'
  /** Show count number */
  showCount?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * SkeletonInteractionCount - Micro-skeleton for like/reply/zap counts
 */
export function SkeletonInteractionCount({ 
  iconSize = 'md', 
  showCount = true,
  className 
}: SkeletonCountProps) {
  const iconSizes = {
    sm: '16px',
    md: '20px',
    lg: '24px'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Skeleton 
        width={iconSizes[iconSize]}
        height={iconSizes[iconSize]}
        className="rounded-full"
        aria-label="Loading interaction button..."
      />
      {showCount && (
        <Skeleton 
          width="24px"
          height="0.875rem"
          className="font-mono"
          aria-label="Loading count..."
        />
      )}
    </div>
  )
}

/**
 * SkeletonLikeButton - Micro-skeleton for like button
 */
export function SkeletonLikeButton({ className }: { className?: string }) {
  return (
    <SkeletonInteractionCount 
      iconSize="md"
      showCount={true}
      className={cn('text-text-secondary', className)}
    />
  )
}

/**
 * SkeletonZapButton - Micro-skeleton for zap button
 */
export function SkeletonZapButton({ className }: { className?: string }) {
  return (
    <SkeletonInteractionCount 
      iconSize="md"
      showCount={true}
      className={cn('text-text-secondary', className)}
    />
  )
}

/**
 * SkeletonReplyButton - Micro-skeleton for reply button
 */
export function SkeletonReplyButton({ className }: { className?: string }) {
  return (
    <SkeletonInteractionCount 
      iconSize="md"
      showCount={true}
      className={cn('text-text-secondary', className)}
    />
  )
}

/**
 * SkeletonRepostButton - Micro-skeleton for repost button
 */
export function SkeletonRepostButton({ className }: { className?: string }) {
  return (
    <SkeletonInteractionCount 
      iconSize="md"
      showCount={true}
      className={cn('text-text-secondary', className)}
    />
  )
}

// =============================================================================
// STATS & METRICS MICRO-SKELETONS
// =============================================================================

/**
 * SkeletonFollowerCount - Micro-skeleton for follower counts
 */
export function SkeletonFollowerCount({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Skeleton 
        width="40px"
        height="1rem"
        className="font-semibold"
        aria-label="Loading count..."
      />
      <Skeleton 
        width="60px"
        height="0.875rem"
        className="opacity-80"
        aria-label="Loading label..."
      />
    </div>
  )
}

/**
 * SkeletonVerificationBadge - Micro-skeleton for verification badges
 */
export function SkeletonVerificationBadge({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Skeleton 
        width="16px"
        height="16px"
        className="rounded-full"
        aria-label="Loading verification badge..."
      />
      <Skeleton 
        width="60px"
        height="0.875rem"
        className="opacity-80"
        aria-label="Loading verification text..."
      />
    </div>
  )
}

// =============================================================================
// SPECIALIZED MICRO-SKELETONS
// =============================================================================

/**
 * SkeletonLightningAddress - Micro-skeleton for Lightning payment info
 */
export function SkeletonLightningAddress({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Skeleton 
        width="16px"
        height="16px"
        className="rounded-full"
        aria-label="Loading lightning icon..."
      />
      <Skeleton 
        width="100px"
        height="0.875rem"
        className="font-mono"
        aria-label="Loading lightning address..."
      />
    </div>
  )
}

/**
 * SkeletonRelayStatus - Micro-skeleton for relay connection status
 */
export function SkeletonRelayStatus({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Skeleton 
        width="12px"
        height="12px"
        className="rounded-full"
        aria-label="Loading connection status..."
      />
      <Skeleton 
        width="80px"
        height="0.875rem"
        aria-label="Loading status text..."
      />
    </div>
  )
}

/**
 * SkeletonWebsite - Micro-skeleton for website links
 */
export function SkeletonWebsite({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Skeleton 
        width="16px"
        height="16px"
        className="rounded-full"
        aria-label="Loading link icon..."
      />
      <Skeleton 
        width="120px"
        height="0.875rem"
        className="font-mono"
        aria-label="Loading website..."
      />
    </div>
  )
}

// =============================================================================
// COMPOSITE MICRO-SKELETONS
// =============================================================================

/**
 * SkeletonPostAuthor - Micro-skeleton for post author info
 */
export function SkeletonPostAuthor({ 
  size = 'md',
  showVerification = true,
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'
  showVerification?: boolean
  className?: string 
}) {
  const avatarSize = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'
  
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <SkeletonAvatar size={avatarSize} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <SkeletonName variant="medium" />
          {showVerification && (
            <Skeleton 
              width="16px"
              height="16px"
              className="rounded-full"
              aria-label="Loading verification..."
            />
          )}
        </div>
        <SkeletonUsername />
      </div>
    </div>
  )
}

/**
 * SkeletonPostMetadata - Micro-skeleton for post metadata row
 */
export function SkeletonPostMetadata({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 font-mono text-xs', className)}>
      <SkeletonTimestamp />
      <span className="text-text-quaternary">•</span>
      <SkeletonNoteId />
      <span className="text-text-quaternary">•</span>
      <SkeletonRelayUrl />
    </div>
  )
}

/**
 * SkeletonInteractionBar - Micro-skeleton for post interaction buttons
 */
export function SkeletonInteractionBar({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-between max-w-lg pt-2', className)}>
      <SkeletonReplyButton />
      <SkeletonRepostButton />
      <SkeletonLikeButton />
      <SkeletonZapButton />
      <Skeleton 
        width="20px"
        height="20px"
        className="rounded-full"
        aria-label="Loading more options..."
      />
    </div>
  )
}

// =============================================================================
// CONDITIONAL RENDERING UTILITIES
// =============================================================================

interface ConditionalSkeletonProps {
  /** Whether to show skeleton or children */
  loading: boolean
  /** Skeleton component to show when loading */
  skeleton: React.ReactNode
  /** Content to show when loaded */
  children: React.ReactNode
  /** Additional wrapper classes */
  className?: string
}

/**
 * ConditionalSkeleton - Utility component for conditional skeleton rendering
 * Shows skeleton when loading, children when loaded
 */
export function ConditionalSkeleton({ 
  loading, 
  skeleton, 
  children, 
  className 
}: ConditionalSkeletonProps) {
  return (
    <div className={className}>
      {loading ? skeleton : children}
    </div>
  )
}

/**
 * SkeletonOr - Inline conditional skeleton utility
 */
export function SkeletonOr({ 
  loading, 
  skeleton, 
  children 
}: { 
  loading: boolean
  skeleton: React.ReactNode
  children: React.ReactNode 
}) {
  return loading ? skeleton : children
}

// =============================================================================
// EXPORTS
// =============================================================================

// Add default export to help with module resolution
export default {
  SkeletonName,
  SkeletonUsername,
  SkeletonNip05,
  SkeletonBio,
  SkeletonTimestamp,
  SkeletonNoteId,
  SkeletonRelayUrl,
  SkeletonInteractionCount,
  SkeletonLikeButton,
  SkeletonZapButton,
  SkeletonReplyButton,
  SkeletonRepostButton,
  SkeletonFollowerCount,
  SkeletonVerificationBadge,
  SkeletonLightningAddress,
  SkeletonRelayStatus,
  SkeletonWebsite,
  SkeletonPostAuthor,
  SkeletonPostMetadata,
  SkeletonInteractionBar,
  ConditionalSkeleton,
  SkeletonOr
} 