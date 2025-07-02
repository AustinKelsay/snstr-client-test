/**
 * @fileoverview Avatar component with fallback support
 * Provides user avatars with automatic fallbacks to initials or default icons
 * Handles loading states and error scenarios gracefully
 */

import { useState, useMemo } from 'react'
import { cn } from '@/utils/cn'

interface AvatarProps {
  /** Profile picture URL */
  src?: string | null
  /** User's display name for initials fallback */
  name?: string | null
  /** Public key for generating consistent fallback */
  pubkey?: string | null
  /** Size of the avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
}

/**
 * Size configuration for avatar
 */
const sizeConfig = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
}

/**
 * Generate initials from display name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Generate consistent background color from string
 */
function getBackgroundColor(seed: string): string {
  // Simple hash function for consistent colors
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Convert to hue (0-360)
  const hue = Math.abs(hash) % 360
  
  // Return HSL color with consistent saturation and lightness
  return `hsl(${hue}, 65%, 50%)`
}

/**
 * Avatar component with automatic fallbacks
 */
export function Avatar({
  src,
  name,
  pubkey,
  size = 'md',
  className,
  isLoading = false
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Generate fallback data
  const fallbackData = useMemo(() => {
    const seed = pubkey || name || 'default'
    const initials = name ? getInitials(name) : pubkey ? pubkey.slice(0, 2).toUpperCase() : '?'
    const backgroundColor = getBackgroundColor(seed)
    
    return { initials, backgroundColor }
  }, [name, pubkey])

  // Determine what to show
  const showImage = src && !imageError && !isLoading
  const showInitials = !showImage && !isLoading
  const showLoading = isLoading || (src && imageLoading && !imageError)

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full overflow-hidden flex-shrink-0',
        sizeConfig[size],
        showInitials && 'text-white font-medium',
        className
      )}
      style={showInitials ? { backgroundColor: fallbackData.backgroundColor } : undefined}
    >
      {showLoading && (
        <div className="w-full h-full bg-gray-200 animate-pulse rounded-full" />
      )}
      
      {showImage && (
        <img
          src={src}
          alt={name || 'User avatar'}
          className="w-full h-full object-cover"
          onError={() => {
            setImageError(true)
            setImageLoading(false)
          }}
          onLoad={() => setImageLoading(false)}
        />
      )}
      
      {showInitials && (
        <span className="select-none">
          {fallbackData.initials}
        </span>
      )}
    </div>
  )
}

/**
 * Small avatar variant for compact layouts
 */
export function AvatarSmall(props: Omit<AvatarProps, 'size'>) {
  return <Avatar {...props} size="sm" />
}

/**
 * Large avatar variant for profile headers
 */
export function AvatarLarge(props: Omit<AvatarProps, 'size'>) {
  return <Avatar {...props} size="lg" />
}

export default Avatar 