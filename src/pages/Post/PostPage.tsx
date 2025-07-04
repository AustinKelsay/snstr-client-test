/**
 * @fileoverview Post page component for displaying individual posts
 * Shows the main post, detailed interactions, and threaded replies
 * Features back navigation, interaction details, and reply composition
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Heart, Repeat2, Zap, MoreHorizontal, Clock } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchPost, fetchPostReplies } from '@/store/slices/postsSlice'
import { fetchPostInteractions, likePost, repostEvent, optimisticLike, optimisticRepost } from '@/store/slices/interactionsSlice'
import { selectPostById, selectPostReplies, selectIsLoadingSinglePost, selectSinglePostError } from '@/store/selectors/postsSelectors'
import { selectPostInteractionData } from '@/store/selectors/interactionsSelectors'
import { PostCard, PostComposer } from '@/components/post'
import { Avatar } from '@/components/common/Avatar'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { useProfileDisplay } from '@/hooks/useProfile'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'
import type { PublicKey } from '@/types'

export interface PostPageProps {
  className?: string
}

/**
 * Post page component displays individual posts with full context
 * Includes the main post, detailed interactions, and threaded replies
 */
export function PostPage({ className }: PostPageProps) {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [isReplyComposerOpen, setIsReplyComposerOpen] = useState(false)

  // Selectors
  const post = useAppSelector((state) => postId ? selectPostById(state, postId) : null)
  const replies = useAppSelector((state) => postId ? selectPostReplies(state, postId) : [])
  const interactions = useAppSelector((state) => postId ? selectPostInteractionData(state, postId) : null)
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const isLoading = useAppSelector(selectIsLoadingSinglePost)
  const error = useAppSelector(selectSinglePostError)

  // Get profile data for the post author
  const profileDisplay = useProfileDisplay(post?.pubkey || '')

  // Load post data on mount
  useEffect(() => {
    if (postId) {
      dispatch(fetchPost(postId))
      dispatch(fetchPostReplies(postId))
      dispatch(fetchPostInteractions(postId))
    }
  }, [dispatch, postId])

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  // Handle interactions
  const handleLike = useCallback(() => {
    if (!isAuthenticated || !post) return

    dispatch(optimisticLike(post.id))
    dispatch(likePost({ 
      eventId: post.id, 
      eventPubkey: post.pubkey 
    }))
  }, [dispatch, isAuthenticated, post])

  const handleRepost = useCallback(() => {
    if (!isAuthenticated || !post) return

    dispatch(optimisticRepost(post.id))
    dispatch(repostEvent({ 
      eventId: post.id, 
      eventPubkey: post.pubkey,
      originalEvent: post
    }))
  }, [dispatch, isAuthenticated, post])

  const handleReply = useCallback(() => {
    if (!isAuthenticated) return
    setIsReplyComposerOpen(true)
  }, [isAuthenticated])

  const handleZap = useCallback(() => {
    if (!isAuthenticated || !post) return
    // TODO: Implement zap functionality
    console.log('Zap post:', post.id)
  }, [isAuthenticated, post])

  const handleAuthorClick = useCallback((pubkey: PublicKey) => {
    navigate(`/profile/${pubkey}`)
  }, [navigate])

  // Loading state
  if (isLoading && !post) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Error state
  if (error && !post) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-error text-lg font-medium">
            Failed to load post
          </div>
          <div className="text-text-secondary">
            {error}
          </div>
          <Button
            onClick={() => postId && dispatch(fetchPost(postId))}
            variant="primary"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Post not found
  if (!post) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="container-padding py-6">
          <EmptyState
            title="Post not found"
            description="This post may have been deleted or you don't have permission to view it."
          />
        </div>
      </div>
    )
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at * 1000), { addSuffix: true })
  const fullTimestamp = new Date(post.created_at * 1000).toLocaleString()

  return (
    <div className={cn('min-h-screen bg-bg-primary', className)}>
      {/* Header with back navigation */}
      <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur border-b border-border-primary">
        <div className="container-padding py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2 hover:bg-bg-hover"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-text-primary font-mono tracking-wide">
                POST
              </h1>
              <div className="text-text-secondary text-sm font-mono">
                {profileDisplay.name} • {timeAgo}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-padding py-6 space-y-6">
        {/* Main Post */}
        <article className="bg-bg-secondary border border-border-primary rounded-sm p-6 space-y-4">
          {/* Author */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleAuthorClick(post.pubkey)}
              className="group flex items-center gap-3 hover:bg-bg-hover px-3 py-2 -mx-3 -my-2 rounded transition-all duration-200"
            >
              <Avatar
                src={profileDisplay.avatar}
                name={profileDisplay.name}
                pubkey={post.pubkey}
                size="lg"
                className="ring-1 ring-border-primary group-hover:ring-accent-primary transition-all duration-200"
              />
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary text-lg group-hover:text-accent-primary transition-colors">
                    {profileDisplay.name}
                  </span>
                  {profileDisplay.isVerified && (
                    <span className="text-accent-primary text-sm animate-pulse">⚡</span>
                  )}
                </div>
                <div className="text-text-secondary font-mono text-sm">
                  @{post.pubkey.slice(0, 16)}...
                </div>
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="text-text-primary text-lg leading-relaxed">
              {post.content}
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-2 text-text-tertiary font-mono text-sm pt-2 border-t border-border-secondary">
              <Clock className="w-4 h-4" />
              <time dateTime={new Date(post.created_at * 1000).toISOString()}>
                {fullTimestamp}
              </time>
            </div>
          </div>

          {/* Interaction Stats */}
          {interactions && (
            <div className="border-t border-border-secondary pt-4">
              <div className="flex items-center gap-6 text-sm">
                {interactions.reposts > 0 && (
                  <div className="flex items-center gap-2 text-text-secondary font-mono">
                    <Repeat2 className="w-4 h-4" />
                    <span className="font-semibold">{interactions.reposts}</span>
                    <span>Reposts</span>
                  </div>
                )}
                {interactions.likes > 0 && (
                  <div className="flex items-center gap-2 text-text-secondary font-mono">
                    <Heart className="w-4 h-4" />
                    <span className="font-semibold">{interactions.likes}</span>
                    <span>Likes</span>
                  </div>
                )}
                {replies.length > 0 && (
                  <div className="flex items-center gap-2 text-text-secondary font-mono">
                    <MessageCircle className="w-4 h-4" />
                    <span className="font-semibold">{replies.length}</span>
                    <span>Replies</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-border-secondary pt-4">
            <div className="flex items-center justify-around">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReply}
                className="flex items-center gap-2 px-4 py-3 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-mono text-sm">Reply</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRepost}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 transition-all duration-200 font-mono text-sm',
                  interactions?.userInteractions.reposted
                    ? 'text-success hover:text-success/80 bg-success/10'
                    : 'text-text-secondary hover:text-success hover:bg-success/10'
                )}
              >
                <Repeat2 className="w-5 h-5" />
                <span>Repost</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 transition-all duration-200 font-mono text-sm',
                  interactions?.userInteractions.liked
                    ? 'text-error hover:text-error/80 bg-error/10'
                    : 'text-text-secondary hover:text-error hover:bg-error/10'
                )}
              >
                <Heart className={cn(
                  'w-5 h-5',
                  interactions?.userInteractions.liked && 'fill-current'
                )} />
                <span>Like</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleZap}
                className="flex items-center gap-2 px-4 py-3 text-text-secondary hover:text-bitcoin hover:bg-bitcoin/10 transition-all duration-200 font-mono text-sm"
              >
                <Zap className="w-5 h-5" />
                <span>Zap</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="p-3 text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all duration-200"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </article>

        {/* Reply Composer */}
        {isReplyComposerOpen && (
          <div className="space-y-4">
            <PostComposer
              replyTo={post}
              placeholder="Reply to this post..."
              onClose={() => setIsReplyComposerOpen(false)}
              autoFocus
            />
          </div>
        )}

        {/* Replies Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-text-secondary text-lg font-mono">
            <div className="w-8 h-px bg-border-secondary" />
            <span>REPLIES</span>
            <div className="flex-1 h-px bg-border-secondary" />
          </div>

          {replies.length > 0 ? (
            <div className="space-y-0 divide-y divide-border-secondary">
              {replies.map((reply) => {
                // Create specific interaction handlers for each reply
                const handleReplyLike = () => {
                  if (!isAuthenticated) return
                  dispatch(optimisticLike(reply.id))
                  dispatch(likePost({ eventId: reply.id, eventPubkey: reply.pubkey }))
                }

                const handleReplyRepost = () => {
                  if (!isAuthenticated) return
                  dispatch(optimisticRepost(reply.id))
                  dispatch(repostEvent({ 
                    eventId: reply.id, 
                    eventPubkey: reply.pubkey,
                    originalEvent: reply
                  }))
                }

                const handleReplyToReply = () => {
                  if (!isAuthenticated) return
                  navigate(`/post/${reply.id}`)
                }

                const handleReplyZap = () => {
                  if (!isAuthenticated) return
                  console.log('Zap reply:', reply.id)
                }

                return (
                  <PostCard
                    key={reply.id}
                    post={reply}
                    onPostClick={(post) => navigate(`/post/${post.id}`)}
                    onLike={handleReplyLike}
                    onRepost={handleReplyRepost}
                    onReply={handleReplyToReply}
                    onZap={handleReplyZap}
                    onAuthorClick={handleAuthorClick}
                    className="border-none"
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              title="No replies yet"
              description="Be the first to reply to this post!"
              className="py-12"
            />
          )}
        </div>
      </div>
    </div>
  )
} 