/**
 * @fileoverview SafeContent component for rendering user content without XSS vulnerabilities
 * Handles hashtags, mentions, URLs, and proper text formatting for large messages
 * Provides expandable content for long posts with proper line breaks and paragraphs
 */

import React, { memo, useState } from 'react'
import { cn } from '@/utils/cn'

interface SafeContentProps {
  /** The content to render safely */
  content: string
  /** Additional CSS classes */
  className?: string
  /** Maximum lines to show before truncating (0 = no limit) */
  maxLines?: number
  /** Whether to show expand/collapse for long content */
  expandable?: boolean
  /** Show "Read More" after this many characters (0 = no limit) */
  truncateAfter?: number
}

/**
 * SafeContent component renders user content safely without XSS vulnerabilities
 * Handles hashtags, mentions, URLs, line breaks, and provides expandable content
 * Optimized for displaying both short and long-form content
 */
export const SafeContent = memo(function SafeContent({ 
  content, 
  className,
  maxLines = 0,
  expandable = true,
  truncateAfter = 500
}: SafeContentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Clean content - preserve line breaks and normalize whitespace
  const cleanContent = content.trim()
  const shouldTruncate = expandable && truncateAfter > 0 && cleanContent.length > truncateAfter
  const displayContent = shouldTruncate && !isExpanded 
    ? cleanContent.slice(0, truncateAfter) + '...'
    : cleanContent

  // Split content into paragraphs (double line breaks)
  const paragraphs = displayContent.split(/\n\s*\n/).filter(p => p.trim())

  /**
   * Renders a single paragraph with inline formatting
   */
  const renderParagraph = (paragraph: string, paragraphIndex: number) => {
    // Pattern to match hashtags, mentions, and URLs
    const pattern = /(#[\w]+|@[\w]+|https?:\/\/[^\s]+)/g
    const parts = paragraph.split(pattern)
    
    return (
      <p key={paragraphIndex} className="mb-3 last:mb-0">
        {parts.map((part, partIndex) => {
          // Handle line breaks within paragraphs
          if (part.includes('\n')) {
            return part.split('\n').map((line, lineIndex, lines) => (
              <React.Fragment key={`${partIndex}-${lineIndex}`}>
                {renderInlineContent(line, `${partIndex}-${lineIndex}`)}
                {lineIndex < lines.length - 1 && <br />}
              </React.Fragment>
            ))
          }
          
          return renderInlineContent(part, `${partIndex}`)
        })}
      </p>
    )
  }

  /**
   * Renders inline content with proper formatting
   */
  const renderInlineContent = (part: string, key: string) => {
    if (!part) return null

    // Check if this part matches any of our patterns
    if (part.startsWith('#') && /^#[\w]+$/.test(part)) {
      // Hashtag
      return (
        <span
          key={key}
          className="text-accent-primary font-medium hover:text-accent-secondary transition-colors cursor-pointer inline-block"
          onClick={() => console.log('Hashtag clicked:', part)}
        >
          {part}
        </span>
      )
    } else if (part.startsWith('@') && /^@[\w]+$/.test(part)) {
      // Mention
      return (
        <span
          key={key}
          className="text-accent-primary font-medium hover:text-accent-secondary transition-colors cursor-pointer inline-block"
          onClick={() => console.log('Mention clicked:', part)}
        >
          {part}
        </span>
      )
    } else if (/^https?:\/\/[^\s]+$/.test(part)) {
      // URL - improved formatting
      const displayUrl = part.length > 60 ? part.slice(0, 60) + '...' : part
      return (
        <a
          key={key}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-link hover:text-text-link-hover underline decoration-1 underline-offset-2 hover:decoration-2 transition-all duration-200 inline-block break-words"
          title={part}
        >
          {displayUrl}
        </a>
      )
    } else {
      // Regular text
      return <span key={key}>{part}</span>
    }
  }

  return (
    <div className={cn("text-text-primary", className)}>
      {/* Content */}
      <div 
        className={cn(
          "leading-relaxed break-words",
          maxLines > 0 && !isExpanded && `line-clamp-${maxLines}`
        )}
        style={maxLines > 0 && !isExpanded ? {
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        } : undefined}
      >
        {paragraphs.length > 1 ? (
          // Multiple paragraphs
          paragraphs.map((paragraph, index) => renderParagraph(paragraph, index))
        ) : (
          // Single paragraph
          renderParagraph(paragraphs[0] || '', 0)
        )}
      </div>

      {/* Expand/Collapse Button */}
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-text-secondary hover:text-accent-primary transition-colors text-sm font-medium inline-flex items-center gap-1"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
          <span className="text-xs">
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>
      )}
    </div>
  )
})

export default SafeContent 