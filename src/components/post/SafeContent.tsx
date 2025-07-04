/**
 * @fileoverview SafeContent component for rendering user content without XSS vulnerabilities
 * Replaces dangerouslySetInnerHTML with safe React element rendering
 * Handles hashtags, mentions, and URLs in post content
 */

import React, { memo } from 'react'
import { cn } from '@/utils/cn'

interface SafeContentProps {
  /** The content to render safely */
  content: string
  /** Additional CSS classes */
  className?: string
}

/**
 * SafeContent component renders user content safely without XSS vulnerabilities
 * Parses hashtags, mentions, and URLs into appropriate React elements
 * Replaces the need for dangerouslySetInnerHTML in content rendering
 */
export const SafeContent = memo(function SafeContent({ 
  content, 
  className 
}: SafeContentProps) {
  // Pattern to match hashtags, mentions, and URLs
  const pattern = /(#[\w]+|@[\w]+|https?:\/\/[^\s]+)/g
  
  // Split content by patterns to get parts
  const parts = content.split(pattern)
  
  return (
    <div className={cn("leading-relaxed break-words", className)}>
      {parts.map((part, index) => {
        // Check if this part matches any of our patterns
        if (part.startsWith('#') && /^#[\w]+$/.test(part)) {
          // Hashtag
          return (
            <span
              key={index}
              className="text-accent-primary font-mono text-sm hover:text-accent-secondary transition-colors cursor-pointer"
            >
              <span className="font-semibold">{part}</span>
            </span>
          )
        } else if (part.startsWith('@') && /^@[\w]+$/.test(part)) {
          // Mention
          return (
            <span
              key={index}
              className="text-accent-primary font-mono text-sm hover:text-accent-secondary transition-colors cursor-pointer"
            >
              <span className="font-semibold">{part}</span>
            </span>
          )
        } else if (/^https?:\/\/[^\s]+$/.test(part)) {
          // URL
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-link hover:text-text-link-hover underline font-mono text-sm break-all"
            >
              {part}
            </a>
          )
        } else {
          // Regular text
          return (
            <span key={index}>{part}</span>
          )
        }
      })}
    </div>
  )
})

export default SafeContent 