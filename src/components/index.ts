/**
 * @fileoverview Component exports
 * Central export file for all reusable components
 */

// Common components
export { Avatar, AvatarSmall, AvatarLarge } from './common/Avatar'
export { default as ErrorBoundary } from './common/ErrorBoundary'
export { default as EmptyState } from './common/EmptyState'
export { default as Logo } from './common/Logo'
export { default as StatusIndicator } from './common/StatusIndicator'

// Skeleton components
export { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton 
} from './common/Skeleton'
export { 
  MessageSkeleton,
  MessageListSkeleton,
  RelayStatusSkeleton,
  RelayListSkeleton,
  SearchResultSkeleton,
  SearchResultsListSkeleton,
  StatsSkeleton,
  NavigationSkeleton,
  ComposerSkeleton
} from './common/DataSkeletons'
export { default as SkeletonDemo } from './common/SkeletonDemo'

// Layout components
export { default as Header } from './layout/Header'
export { default as Sidebar } from './layout/Sidebar'
export { default as PageLayout } from './layout/PageLayout'
export { default as MobileNavigation } from './layout/MobileNavigation'

// UI components
export { default as Button } from './ui/Button'
export { default as Input } from './ui/Input'
export { default as LoadingSpinner } from './ui/LoadingSpinner'
export { default as Modal } from './ui/Modal'
export { default as Select } from './ui/Select'
export { default as SettingsNavButton } from './ui/SettingsNavButton'
export { default as Textarea } from './ui/Textarea'

// Post components
export { 
  PostCard, 
  PostComposer, 
  PostList,
  PostCardSkeleton,
  PostListSkeleton,
  ThreadPostSkeleton
} from './post'

// Profile components
export { 
  ProfileCard, 
  ProfileHeader,
  ProfileCardSkeleton,
  ProfileHeaderSkeleton,
  ProfileListSkeleton
} from './profile' 