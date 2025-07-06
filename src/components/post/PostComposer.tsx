/**
 * @fileoverview PostComposer component for creating and publishing text notes
 * Handles composition interface with character counting, validation, and publishing
 * Supports replies, mentions, hashtags, and real-time preview functionality
 * Enhanced with sophisticated cypherpunk UI design and smooth animations
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Send, X, Hash, AtSign, Eye, EyeOff, Terminal, User, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectIsAuthenticated } from '@/store/selectors/authSelectors'
import { addPost } from '@/store/slices/postsSlice'
import { nostrClient } from '@/features/nostr/nostrClient'
import Button from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { SafeContent } from './SafeContent'
import { Avatar } from '@/components/common/Avatar'
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
  /** Whether to show in compact mode */
  compact?: boolean
}

/**
 * PostComposer component provides interface for creating and publishing Nostr text notes
 * Features sophisticated cypherpunk UI with smooth animations and enhanced visual hierarchy
 * Supports mentions, hashtags, character counting, and real-time validation
 */
export function PostComposer({
  isModal = false,
  onClose,
  replyTo,
  placeholder = "What's happening in the matrix?",
  maxLength = 280,
  className,
  autoFocus = false,
  compact = false,
}: PostComposerProps) {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  
  // Component state
  const [content, setContent] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showTechnical, setShowTechnical] = useState(false)
  const [isExpanded, setIsExpanded] = useState(!compact)
  
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

  // Auto-expand when user starts typing
  useEffect(() => {
    if (compact && content.trim().length > 0 && !isExpanded) {
      setIsExpanded(true)
    }
  }, [compact, content, isExpanded])

  // Character count and validation
  const characterCount = content.length
  const isOverLimit = characterCount > maxLength
  const isEmpty = content.trim().length === 0
  const canPublish = isAuthenticated && !isEmpty && !isOverLimit && !isPublishing
  const isNearLimit = characterCount > maxLength * 0.8
  const isAtLimit = characterCount > maxLength * 0.9

  // Calculate progress percentage for character counter
  const progressPercentage = Math.min((characterCount / maxLength) * 100, 100)

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

  // Toggle expansion
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded)
  }, [isExpanded])

  return (
    <div 
      className={cn(
        'group/composer relative overflow-hidden transition-all duration-300 ease-in-out',
        'bg-gradient-to-br from-bg-secondary to-bg-tertiary',
        'border border-border-primary hover:border-border-secondary',
        isModal ? 'rounded-lg shadow-xl' : 'rounded-none',
        'backdrop-blur-sm',
        className
      )}
    >
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-transparent to-accent-primary/5 opacity-0 group-hover/composer:opacity-100 transition-opacity duration-500" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-bg-tertiary/50 backdrop-blur-sm border-b border-border-primary">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Avatar 
            size="md" 
            className="ring-2 ring-accent-primary/20 group-hover/composer:ring-accent-primary/40 transition-all duration-300"
          />
          
          {/* Title */}
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-text-primary font-mono tracking-wider">
              {replyTo ? (
                <span className="flex items-center gap-2">
                  <span className="text-accent-primary">REPLY</span>
                  <ChevronDown className="w-4 h-4 text-text-tertiary" />
                </span>
              ) : (
                <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                  COMPOSE
                </span>
              )}
            </h3>
            {replyTo && (
              <div className="text-xs text-text-secondary font-mono">
                TO <span className="text-accent-primary font-semibold">@{replyTo.author_name || `${replyTo.pubkey.slice(0, 8)}...`}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              isAuthenticated ? 'bg-success shadow-lg shadow-success/50 animate-pulse' : 'bg-error shadow-lg shadow-error/50'
            )} />
            <span className="text-xs font-mono text-text-secondary">
              {isAuthenticated ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          {/* Expand/Collapse button for compact mode */}
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="p-2 hover:bg-accent-primary/10 hover:text-accent-primary transition-all duration-200"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
          
          {/* Close button */}
          {isModal && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2 hover:bg-error/10 hover:text-error transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Reply context */}
      {replyTo && isExpanded && (
        <div className="relative px-6 py-4 bg-bg-primary/30 border-b border-border-primary">
          <div className="flex items-start gap-4">
            <div className="w-8 h-px bg-gradient-to-r from-accent-primary to-transparent mt-3" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary font-mono">
                <span>REPLYING TO</span>
                <span className="text-accent-primary font-semibold">@{replyTo.author_name}</span>
              </div>
              <div className="relative group/quote">
                <div className="text-sm text-text-tertiary font-mono bg-bg-secondary/50 p-4 rounded-lg border border-border-primary backdrop-blur-sm">
                  "{replyTo.content.slice(0, 100)}{replyTo.content.length > 100 && '...'}"
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 to-transparent opacity-0 group-hover/quote:opacity-100 transition-opacity duration-300 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main composer area */}
      <div className={cn(
        'relative transition-all duration-300 ease-in-out',
        isExpanded ? 'opacity-100 max-h-[800px]' : 'opacity-70 max-h-[120px] overflow-hidden'
      )}>
        <div className="p-6 space-y-4">
          {/* Textarea */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              maxLength={maxLength}
              className={cn(
                'min-h-[120px] resize-none border-none bg-transparent p-0',
                'text-text-primary placeholder:text-text-tertiary text-lg leading-relaxed',
                'focus:ring-0 focus:outline-none transition-all duration-300',
                showTechnical && 'font-mono text-base',
                'scrollbar-thin scrollbar-track-bg-tertiary scrollbar-thumb-border-secondary hover:scrollbar-thumb-border-primary'
              )}
              disabled={isPublishing}
            />
            
            {/* Character progress indicator */}
            {content.length > 0 && (
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-border-primary"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${progressPercentage} ${100 - progressPercentage}`}
                      className={cn(
                        'transition-all duration-300',
                        isOverLimit ? 'text-error' : isAtLimit ? 'text-warning' : 'text-accent-primary'
                      )}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn(
                      'text-xs font-mono font-bold',
                      isOverLimit ? 'text-error' : isAtLimit ? 'text-warning' : 'text-text-secondary'
                    )}>
                      {characterCount > 999 ? '999+' : characterCount}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview mode */}
          {showPreview && content.trim() && (
            <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-2 text-text-secondary text-xs font-mono">
                <div className="w-8 h-px bg-gradient-to-r from-accent-primary to-transparent" />
                <span>PREVIEW</span>
                <div className="flex-1 h-px bg-gradient-to-r from-accent-primary/30 to-transparent" />
              </div>
              <div className="relative group/preview">
                <div className="p-4 bg-bg-tertiary/30 border border-border-primary rounded-lg backdrop-blur-sm">
                  <SafeContent 
                    content={content}
                    className="text-text-primary"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 rounded-lg" />
              </div>
            </div>
          )}

          {/* Technical info */}
          {showTechnical && (
            <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-2 text-text-secondary text-xs font-mono">
                <div className="w-8 h-px bg-gradient-to-r from-accent-primary to-transparent" />
                <span>TECHNICAL DATA</span>
                <div className="flex-1 h-px bg-gradient-to-r from-accent-primary/30 to-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="p-3 bg-bg-primary/50 border border-border-primary rounded-lg font-mono text-xs backdrop-blur-sm">
                    <div className="text-text-secondary">MENTIONS: <span className="text-accent-primary font-bold">{parsedContent.mentions.length}</span></div>
                  </div>
                  <div className="p-3 bg-bg-primary/50 border border-border-primary rounded-lg font-mono text-xs backdrop-blur-sm">
                    <div className="text-text-secondary">HASHTAGS: <span className="text-accent-primary font-bold">{parsedContent.hashtags.length}</span></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-bg-primary/50 border border-border-primary rounded-lg font-mono text-xs backdrop-blur-sm">
                    <div className="text-text-secondary">URLS: <span className="text-accent-primary font-bold">{parsedContent.urls.length}</span></div>
                  </div>
                  <div className="p-3 bg-bg-primary/50 border border-border-primary rounded-lg font-mono text-xs backdrop-blur-sm">
                    <div className="text-text-secondary">BYTES: <span className="text-accent-primary font-bold">{new Blob([content]).size}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="relative group/error animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
              <div className="p-4 bg-error/10 border border-error/30 rounded-lg backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-error rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <div className="text-error font-mono text-sm font-semibold">PUBLISH FAILED</div>
                    <div className="text-error/80 text-sm mt-1">{error}</div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-error/5 to-transparent opacity-0 group-hover/error:opacity-100 transition-opacity duration-300 rounded-lg" />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {isExpanded && (
        <div className="relative z-10 px-6 py-4 bg-bg-tertiary/50 backdrop-blur-sm border-t border-border-primary">
          <div className="flex items-center justify-between">
            {/* Tools */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertAtCursor('@')}
                disabled={isPublishing}
                className="px-3 py-2 font-mono text-xs hover:bg-accent-primary/10 hover:text-accent-primary transition-all duration-200 group/tool"
                title="Insert mention"
              >
                <AtSign className="w-4 h-4 group-hover/tool:scale-110 transition-transform duration-200" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertAtCursor('#')}
                disabled={isPublishing}
                className="px-3 py-2 font-mono text-xs hover:bg-accent-primary/10 hover:text-accent-primary transition-all duration-200 group/tool"
                title="Insert hashtag"
              >
                <Hash className="w-4 h-4 group-hover/tool:scale-110 transition-transform duration-200" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                disabled={isPublishing}
                className={cn(
                  'px-3 py-2 font-mono text-xs transition-all duration-200 group/tool',
                  showPreview 
                    ? 'text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20' 
                    : 'hover:bg-accent-primary/10 hover:text-accent-primary'
                )}
                title="Toggle preview"
              >
                {showPreview ? <EyeOff className="w-4 h-4 group-hover/tool:scale-110 transition-transform duration-200" /> : <Eye className="w-4 h-4 group-hover/tool:scale-110 transition-transform duration-200" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTechnical(!showTechnical)}
                disabled={isPublishing}
                className={cn(
                  'px-3 py-2 font-mono text-xs transition-all duration-200 group/tool',
                  showTechnical 
                    ? 'text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20' 
                    : 'hover:bg-accent-primary/10 hover:text-accent-primary'
                )}
                title="Toggle technical view"
              >
                <Terminal className="w-4 h-4 group-hover/tool:scale-110 transition-transform duration-200" />
              </Button>
            </div>

            {/* Character count and publish */}
            <div className="flex items-center gap-4">
              {/* Character counter */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  'text-xs font-mono tabular-nums transition-all duration-200',
                  isOverLimit ? 'text-error font-bold' : 
                  isAtLimit ? 'text-warning font-bold' : 
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
              </div>

              {/* Publish button */}
              <Button
                onClick={handlePublish}
                disabled={!canPublish}
                variant={canPublish ? 'primary' : 'outline'}
                size="md"
                className={cn(
                  'min-w-[120px] font-mono font-bold tracking-wide relative overflow-hidden group/publish',
                  canPublish && 'shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40'
                )}
              >
                {isPublishing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>SENDING...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 group-hover/publish:translate-x-1 transition-transform duration-200" />
                    <span>{replyTo ? 'REPLY' : 'POST'}</span>
                  </div>
                )}
                
                {/* Animated background effect */}
                {canPublish && (
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 opacity-0 group-hover/publish:opacity-100 transition-opacity duration-200" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Not authenticated message */}
      {!isAuthenticated && (
        <div className="relative z-10 px-6 py-4 bg-gradient-to-r from-warning/10 to-error/10 border-t border-warning/30 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 text-warning text-sm font-mono">
            <div className="w-5 h-5 bg-warning/20 rounded-full flex items-center justify-center animate-pulse">
              <User className="w-3 h-3" />
            </div>
            <span className="font-semibold">CONNECT NOSTR EXTENSION TO PUBLISH</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostComposer 