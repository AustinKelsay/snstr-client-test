/**
 * @fileoverview SafeContent component for rendering user content without XSS vulnerabilities
 * Handles hashtags, mentions, URLs, emoji shortcodes, NIP-19 entities, and proper text formatting for large messages
 * Provides expandable content for long posts with proper line breaks and paragraphs
 */

import React, { memo, useState } from 'react'
import { cn } from '@/utils/cn'
import { 
  isNip19Entity, 
  getEntityType, 
  formatNip19ForDisplay, 
  extractPubkey, 
  extractEventId,
  getEntityDescription 
} from '@/utils/nip19'
import { shortcodeToEmoji, hasEmojiMapping } from '@/utils/emoji'

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
  /** Callback fired when a mention is clicked */
  onMentionClick?: (mention: string) => void
  /** Callback fired when a hashtag is clicked */
  onHashtagClick?: (hashtag: string) => void
  /** Callback fired when a NIP-19 entity is clicked */
  onNip19Click?: (entity: string, type: 'pubkey' | 'event') => void
  /** Callback fired when an emoji shortcode is clicked */
  onEmojiClick?: (emojiName: string) => void
  /** Whether to convert emoji shortcodes to Unicode emojis */
  convertEmojis?: boolean
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
  truncateAfter = 500,
  onMentionClick,
  onHashtagClick,
  onNip19Click,
  onEmojiClick,
  convertEmojis = true
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
    // Pattern to match hashtags, mentions, URLs, emoji shortcodes, and NIP-19 entities
    const pattern = /(#[\w\-_]+|@[\w\-_]+|:[a-zA-Z0-9_\-+]+:|https?:\/\/[^\s]+|nostr:[a-z0-9]+1[a-z0-9]+|n(?:pub|sec|note|profile|event|addr|relay)1[a-z0-9]+)/g
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

    // Check for NIP-19 entities first (most specific)
    const nip19Entity = part.replace(/^nostr:/, '') // Remove nostr: prefix if present
    if (isNip19Entity(nip19Entity)) {
      const entityType = getEntityType(nip19Entity)
      const description = getEntityDescription(nip19Entity)
      const displayText = formatNip19ForDisplay(nip19Entity, { 
        startChars: 8, 
        endChars: 6, 
        showPrefix: true 
      })
      
      // Determine click handler type
      let clickType: 'pubkey' | 'event' = 'pubkey'
      if (entityType === 'note' || entityType === 'nevent') {
        clickType = 'event'
      } else if (extractEventId(nip19Entity)) {
        clickType = 'event'
      } else if (extractPubkey(nip19Entity)) {
        clickType = 'pubkey'
      }

      return (
        <span
          key={key}
          className="text-purple-400 hover:text-purple-300 font-medium transition-colors cursor-pointer inline-block border border-purple-400/20 hover:border-purple-300/40 rounded px-1 py-0.5 bg-purple-400/5 hover:bg-purple-300/10"
          title={`${description}: ${nip19Entity}`}
          onClick={(e) => {
            e.stopPropagation()
            if (onNip19Click) {
              onNip19Click(nip19Entity, clickType)
            }
          }}
        >
          {displayText}
        </span>
      )
    }

    // Check for emoji shortcodes
    if (part.startsWith(':') && part.endsWith(':') && /^:[a-zA-Z0-9_\-+]+:$/.test(part)) {
      // Emoji shortcode (like :ohayo:, :heart:, etc.)
      const emojiName = part.slice(1, -1) // Remove colons
      const hasMapping = hasEmojiMapping(emojiName)
      const displayText = convertEmojis && hasMapping ? shortcodeToEmoji(emojiName) : part
      
      return (
        <span
          key={key}
          className={cn(
            "font-medium transition-colors inline-block rounded px-1 py-0.5 text-sm",
            hasMapping 
              ? "text-yellow-400 hover:text-yellow-300 bg-yellow-400/10 hover:bg-yellow-300/20 border border-yellow-400/20"
              : "text-text-secondary bg-bg-tertiary border border-border-secondary",
            onEmojiClick ? "cursor-pointer" : "cursor-default"
          )}
          title={`Emoji: ${emojiName}${hasMapping ? ` (${shortcodeToEmoji(emojiName)})` : ''}`}
          onClick={onEmojiClick ? (e) => {
            e.stopPropagation()
            onEmojiClick(emojiName)
          } : undefined}
        >
          {displayText}
        </span>
      )
    }

    // Check if this part matches any of our other patterns
    if (part.startsWith('#') && /^#[\w\-_]+$/.test(part)) {
      // Hashtag
      return (
        <span
          key={key}
          className="text-accent-primary font-medium hover:text-accent-secondary transition-colors cursor-pointer inline-block"
          onClick={(e) => {
            e.stopPropagation()
            if (onHashtagClick) {
              onHashtagClick(part.slice(1)) // Remove # prefix
            }
          }}
        >
          {part}
        </span>
      )
    } else if (part.startsWith('@') && /^@[\w\-_]+$/.test(part)) {
      // Mention
      return (
        <span
          key={key}
          className="text-accent-primary font-medium hover:text-accent-secondary transition-colors cursor-pointer inline-block"
          onClick={(e) => {
            e.stopPropagation()
            if (onMentionClick) {
              onMentionClick(part.slice(1)) // Remove @ prefix
            }
          }}
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
          onClick={(e) => e.stopPropagation()}
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
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
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