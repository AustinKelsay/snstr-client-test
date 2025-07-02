/**
 * @fileoverview PostComposer component for creating and publishing text notes
 * Handles composition interface with character counting, validation, and publishing
 * Supports replies, mentions, hashtags, and real-time preview functionality
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Send, X, Hash, AtSign, Smile } from 'lucide-react'
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
  placeholder = "What's happening?",
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
      .replace(/(#\w+)/g, '<span class="text-accent-primary font-medium">$1</span>')
      .replace(/(@[\w]+)/g, '<span class="text-accent-primary font-medium">$1</span>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-accent-primary hover:underline">$1</a>')
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
        'flex flex-col',
        isModal && 'bg-bg-secondary border border-border-primary rounded-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-primary">
        <h3 className="text-lg font-semibold text-text-primary">
          {replyTo ? 'Reply' : 'Compose Post'}
        </h3>
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

      {/* Reply context */}
      {replyTo && (
        <div className="p-4 border-b border-border-primary bg-bg-tertiary">
          <div className="text-sm text-text-secondary mb-2">
            Replying to <span className="text-accent-primary">@{replyTo.author_name}</span>
          </div>
          <div className="text-sm text-text-secondary italic">
            {replyTo.content.slice(0, 100)}{replyTo.content.length > 100 && '...'}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="flex-1 p-4">
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'min-h-[120px] resize-none border-none bg-transparent',
            'text-text-primary placeholder:text-text-tertiary',
            'focus:ring-0 focus:outline-none'
          )}
          disabled={isPublishing}
        />

        {/* Preview mode */}
        {showPreview && content.trim() && (
          <div className="mt-4 p-3 border border-border-primary rounded bg-bg-tertiary">
            <div className="text-sm text-text-secondary mb-2">Preview:</div>
            <div 
              className="text-text-primary"
              dangerouslySetInnerHTML={{ __html: formatPreviewContent(content) }}
            />
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mt-3 p-3 bg-error/10 border border-error rounded text-error text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border-primary">
        {/* Tools */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertAtCursor('@')}
            disabled={isPublishing}
            className="p-2"
          >
            <AtSign className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertAtCursor('#')}
            disabled={isPublishing}
            className="p-2"
          >
            <Hash className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            disabled={isPublishing}
            className={cn('p-2', showPreview && 'text-accent-primary')}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Character count and publish */}
        <div className="flex items-center space-x-3">
          {/* Character counter */}
          <div className={cn(
            'text-sm',
            isOverLimit ? 'text-error' : 'text-text-secondary'
          )}>
            {characterCount}/{maxLength}
          </div>

          {/* Publish button */}
          <Button
            onClick={handlePublish}
            disabled={!canPublish}
            className="min-w-[80px]"
          >
            {isPublishing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Publishing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>{replyTo ? 'Reply' : 'Post'}</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Not authenticated message */}
      {!isAuthenticated && (
        <div className="p-4 bg-warning/10 border-t border-warning text-warning text-sm text-center">
          Connect your Nostr extension to publish posts
        </div>
      )}
    </div>
  )
}

export default PostComposer 