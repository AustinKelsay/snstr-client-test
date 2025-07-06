/**
 * @fileoverview Base Skeleton component for loading states
 * Provides consistent skeleton loading animation across all components
 * Follows the cypherpunk theme with matrix green accents
 */

import React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps {
  /** Custom CSS classes */
  className?: string;
  /** Width of the skeleton element */
  width?: string | number;
  /** Height of the skeleton element */
  height?: string | number;
  /** Whether to use rounded corners */
  rounded?: boolean | 'full';
  /** Additional styling for specific skeleton types */
  variant?: 'text' | 'avatar' | 'button' | 'card';
  /** Custom inline styles */
  style?: React.CSSProperties;
}

/**
 * Base skeleton component with cypherpunk theme loading animation
 * Provides consistent loading states across the application
 * 
 * @param className - Additional CSS classes
 * @param width - Width of skeleton element
 * @param height - Height of skeleton element  
 * @param rounded - Border radius style
 * @param variant - Predefined skeleton type
 * @param style - Custom inline styles
 */
export function Skeleton({
  className,
  width,
  height,
  rounded = false,
  variant = 'text',
  style,
  ...props
}: SkeletonProps) {
  const skeletonStyles: React.CSSProperties = {
    width,
    height,
    ...style,
  };

  const skeletonClasses = cn(
    // Base skeleton styles
    'skeleton-base',
    // Variant-specific styles
    {
      'skeleton-text': variant === 'text',
      'skeleton-avatar': variant === 'avatar',
      'skeleton-button': variant === 'button',
      'skeleton-card': variant === 'card',
    },
    // Rounded corners
    {
      'rounded-sm': rounded === true,
      'rounded-full': rounded === 'full',
    },
    className
  );

  return (
    <div
      className={skeletonClasses}
      style={skeletonStyles}
      aria-label="Loading..."
      {...props}
    />
  );
}

/**
 * Skeleton for text lines with automatic width variation
 * Creates more natural loading appearance
 */
export function SkeletonText({
  lines = 1,
  className,
  ...props
}: {
  lines?: number;
  className?: string;
} & Omit<SkeletonProps, 'variant'>) {
  const textLines = Array.from({ length: lines }, (_, index) => {
    // Vary width for more natural appearance
    const width = index === lines - 1 ? '75%' : '100%';
    
    return (
      <Skeleton
        key={index}
        variant="text"
        width={width}
        height="1rem"
        className={cn('mb-2 last:mb-0', className)}
        {...props}
      />
    );
  });

  return <div className="space-y-2">{textLines}</div>;
}

/**
 * Skeleton for avatar/profile images
 * Provides consistent circular loading state
 */
export function SkeletonAvatar({
  size = 'md',
  className,
  ...props
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
} & Omit<SkeletonProps, 'variant' | 'rounded'>) {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <Skeleton
      variant="avatar"
      rounded="full"
      className={cn(sizeMap[size], className)}
      {...props}
    />
  );
}

/**
 * Skeleton for button elements
 * Matches typical button dimensions
 */
export function SkeletonButton({
  size = 'md',
  className,
  ...props
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & Omit<SkeletonProps, 'variant'>) {
  const sizeMap = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-28',
  };

  return (
    <Skeleton
      variant="button"
      rounded
      className={cn(sizeMap[size], className)}
      {...props}
    />
  );
} 