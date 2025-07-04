/**
 * @fileoverview PostComposer component for creating and publishing text notes
 * Handles composition interface with character counting, validation, and publishing
 * Supports replies, mentions, hashtags, and real-time preview functionality
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Send, X, Hash, AtSign, Eye, EyeOff, Terminal } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectIsAuthenticated } from '@/store/selectors/authSelectors'
import { addPost } from '@/store/slices/postsSlice'
import { nostrClient } from '@/features/nostr/nostrClient'
import Button from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/utils/cn'
import type { Post, NostrEvent } from '@/types'

interface PostComposerProps {
  /** Whether composer is in modal mode */
  isModal?: boolean
  /** Callback fired when composer should be closed */
  onClose?: () => void
  /** Post being replied to (for reply mode) */
  replyTo?: Post
  /** Placeholder text */
  placeholder?: string
  /** Maximum character limit */
  maxLength?: number
  /** Additional CSS classes */
  className?: string
  /** Whether to auto-focus the input */
  autoFocus?: boolean
}

/**
 * PostComposer component provides interface for creating and publishing Nostr text notes
 * Supports mentions, hashtags, character counting, and real-time validation
 * Integrates with SNSTR library for event creation and publishing
 */
export function PostComposer({
  isModal = false,
  onClose,
  replyTo,
  placeholder = "What's happening in the matrix?",
  maxLength = 280,
  className,
  autoFocus = false,
}: PostComposerProps) {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  
  // Component state
  const [content, setContent] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showTechnical, setShowTechnical] = useState(false)
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  // Clear error when content changes
  useEffect(() => {
    if (error && content.trim().length > 0) {
      setError(null)
    }
  }, [content, error])

  // Character count and validation
  const characterCount = content.length
  const isOverLimit = characterCount > maxLength
  const isEmpty = content.trim().length === 0
  const canPublish = isAuthenticated && !isEmpty && !isOverLimit && !isPublishing
  const isNearLimit = characterCount > maxLength * 0.8

  // Parse content for mentions and hashtags
  const parsedContent = useMemo(() => {
    const mentions = content.match(/@[\w]+/g) || []
    const hashtags = content.match(/#[\w]+/g) || []
    const urls = content.match(/https?:\/\/[^\s]+/g) || []

    return {
      mentions: mentions.map(m => m.slice(1)), // Remove @ prefix
      hashtags: hashtags.map(h => h.slice(1)), // Remove # prefix  
      urls,
      hasMedia: false, // TODO: Implement media detection
    }
  }, [content])

  // Format content with highlighting
  const formatPreviewContent = useCallback((text: string) => {
    return text
      .replace(/(#[\w]+)/g, '<span class="text-accent-primary font-mono font-semibold">#$1</span>')
      .replace(/(@[\w]+)/g, '<span class="text-accent-primary font-mono font-semibold">@$1</span>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-text-link hover:text-text-link-hover underline font-mono break-all">$1</a>')
  }, [])

  // Handle content change
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }, [])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to publish
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handlePublish()
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && onClose) {
      e.preventDefault()
      onClose()
    }
  }, [onClose])

  // Handle publish
  const handlePublish = useCallback(async () => {
    if (!canPublish) return

    setIsPublishing(true)
    setError(null)

    try {
      // Use NIP-07 extension to sign and publish text note
      if (typeof window !== 'undefined' && window.nostr) {
        // Build tags array for reply context
        const tags: string[][] = []
        
        // Add reply tags if replying
        if (replyTo) {
          // NIP-10 threading: add 'e' tags for reply context
          tags.push(['e', replyTo.id, '', 'reply'])
          if (replyTo.root_event) {
            tags.push(['e', replyTo.root_event, '', 'root'])
          }
          // Add 'p' tag for reply author
          tags.push(['p', replyTo.pubkey])
        }

        // Add hashtag tags  
        parsedContent.hashtags.forEach(hashtag => {
          tags.push(['t', hashtag])
        })

        // Create unsigned event
        const unsignedEvent = {
          kind: 1, // Text note
          created_at: Math.floor(Date.now() / 1000),
          tags,
          content: content.trim(),
        }

        // Sign event with NIP-07 extension
        const signedEvent = await window.nostr.signEvent(unsignedEvent)
        
        // Publish via nostr client
        await nostrClient.publishEvent(signedEvent as NostrEvent)

        // Add to local state optimistically
        const post: Post = {
          ...signedEvent,
          author_name: 'You', // TODO: Get from user profile
          replies_count: 0,
          likes_count: 0,
          reposts_count: 0,
          zaps_count: 0,
          is_liked: false,
          is_reposted: false,
          is_bookmarked: false,
          reply_to: replyTo?.id,
          root_event: replyTo?.root_event || replyTo?.id,
          mentions: parsedContent.mentions,
          hashtags: parsedContent.hashtags,
          urls: parsedContent.urls,
        } as Post

        dispatch(addPost(post))

        // Clear content and close
        setContent('')
        if (onClose) {
          onClose()
        }
      } else {
        throw new Error('NIP-07 extension not available. Please install a Nostr extension like Alby.')
      }

    } catch (error) {
      console.error('Failed to publish post:', error)
      setError(error instanceof Error ? error.message : 'Failed to publish post')
    } finally {
      setIsPublishing(false)
    }
  }, [canPublish, dispatch, onClose, parsedContent, content, replyTo])

  // Handle close
  const handleClose = useCallback(() => {
    if (content.trim() && !window.confirm('Discard your post?')) {
      return
    }
    setContent('')
    setError(null)
    if (onClose) {
      onClose()
    }
  }, [content, onClose])

  // Insert text at cursor
  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.slice(0, start) + text + content.slice(end)
    
    setContent(newContent)
    
    // Reset cursor position
    setTimeout(() => {
      textarea.setSelectionRange(start + text.length, start + text.length)
      textarea.focus()
    }, 0)
  }, [content])

  return (
    <div 
      className={cn(
        'flex flex-col bg-bg-secondary border border-border-primary',
        isModal && 'rounded-sm shadow-lg',
        'overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-bg-tertiary border-b border-border-primary">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-text-primary font-mono tracking-wide">
            {replyTo ? 'REPLY' : 'COMPOSE'}
        </h3>
          {replyTo && (
            <span className="text-text-secondary font-mono text-xs bg-bg-quaternary px-2 py-1 rounded">
              TO {replyTo.author_name || `${replyTo.pubkey.slice(0, 8)}...`}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Connection status */}
          <div className={cn(
            'w-2 h-2 rounded-full',
            isAuthenticated ? 'bg-success animate-pulse' : 'bg-error'
          )} />
          
        {isModal && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        </div>
      </div>

      {/* Reply context */}
      {replyTo && (
        <div className="p-4 border-b border-border-primary bg-bg-primary">
          <div className="flex items-start gap-3">
            <div className="w-8 h-px bg-border-secondary mt-3" />
            <div className="flex-1 space-y-2">
              <div className="text-sm text-text-secondary font-mono">
                REPLYING TO <span className="text-accent-primary font-semibold">@{replyTo.author_name}</span>
              </div>
              <div className="text-sm text-text-tertiary font-mono bg-bg-secondary p-3 rounded border">
                "{replyTo.content.slice(0, 100)}{replyTo.content.length > 100 && '...'}"
              </div>
          </div>
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="flex-1 p-4 space-y-4">
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          showCharCount={true}
          autoResize={true}
          variant={showTechnical ? 'technical' : 'default'}
          className={cn(
            'min-h-[120px] resize-none border-none bg-transparent',
            'text-text-primary placeholder:text-text-tertiary',
            'focus:ring-0 focus:outline-none',
            showTechnical && 'font-mono text-sm'
          )}
          disabled={isPublishing}
        />

        {/* Preview mode */}
        {showPreview && content.trim() && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-text-secondary text-xs font-mono">
              <div className="w-8 h-px bg-border-secondary" />
              <span>PREVIEW</span>
              <div className="flex-1 h-px bg-border-secondary" />
            </div>
            <div className="p-4 bg-bg-tertiary border border-border-primary rounded">
            <div 
                className="text-text-primary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatPreviewContent(content) }}
            />
            </div>
          </div>
        )}

        {/* Technical info */}
        {showTechnical && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-text-secondary text-xs font-mono">
              <div className="w-8 h-px bg-border-secondary" />
              <span>TECHNICAL DATA</span>
              <div className="flex-1 h-px bg-border-secondary" />
            </div>
            <div className="p-4 bg-bg-primary border border-border-primary rounded font-mono text-xs space-y-2">
              <div className="text-text-secondary">MENTIONS: <span className="text-accent-primary">{parsedContent.mentions.length}</span></div>
              <div className="text-text-secondary">HASHTAGS: <span className="text-accent-primary">{parsedContent.hashtags.length}</span></div>
              <div className="text-text-secondary">URLS: <span className="text-accent-primary">{parsedContent.urls.length}</span></div>
              <div className="text-text-secondary">BYTES: <span className="text-accent-primary">{new Blob([content]).size}</span></div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="p-4 bg-error/10 border border-error rounded text-error text-sm font-mono">
            <div className="flex items-start gap-2">
              <span className="text-error">▲</span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 bg-bg-tertiary border-t border-border-primary">
        {/* Tools */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertAtCursor('@')}
            disabled={isPublishing}
            className="p-2 font-mono text-xs"
            title="Insert mention"
          >
            <AtSign className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertAtCursor('#')}
            disabled={isPublishing}
            className="p-2 font-mono text-xs"
            title="Insert hashtag"
          >
            <Hash className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            disabled={isPublishing}
            className={cn('p-2 font-mono text-xs', showPreview && 'text-accent-primary bg-accent-primary/10')}
            title="Toggle preview"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTechnical(!showTechnical)}
            disabled={isPublishing}
            className={cn('p-2 font-mono text-xs', showTechnical && 'text-accent-primary bg-accent-primary/10')}
            title="Toggle technical view"
          >
            <Terminal className="w-4 h-4" />
          </Button>
        </div>

        {/* Character count and publish */}
        <div className="flex items-center gap-4">
          {/* Character counter */}
          <div className={cn(
            'text-xs font-mono tabular-nums',
            isOverLimit ? 'text-error font-bold' : 
            isNearLimit ? 'text-warning' : 
            'text-text-secondary'
          )}>
            <span className={isOverLimit ? 'text-error' : ''}>
              {characterCount.toLocaleString()}
            </span>
            <span className="text-text-quaternary mx-1">/</span>
            <span className="text-text-tertiary">
              {maxLength.toLocaleString()}
            </span>
          </div>

          {/* Publish button */}
          <Button
            onClick={handlePublish}
            disabled={!canPublish}
            variant={canPublish ? 'primary' : 'outline'}
            size="md"
            className="min-w-[100px] font-mono"
          >
            {isPublishing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>SENDING...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span>{replyTo ? 'REPLY' : 'POST'}</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Not authenticated message */}
      {!isAuthenticated && (
        <div className="p-4 bg-warning/10 border-t border-warning text-warning text-sm text-center font-mono">
          <div className="flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>CONNECT NOSTR EXTENSION TO PUBLISH</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostComposer 