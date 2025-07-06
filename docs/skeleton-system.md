# Skeleton Loading System

This document provides comprehensive guidance on using the advanced skeleton loading system in snstr-client-test. The skeleton system provides granular field-level loading states that maintain the cypherpunk theme while ensuring excellent user experience during content loading.

---

## Overview

The skeleton loading system consists of:

- **Base Skeleton Components**: Core building blocks for creating loading states
- **Micro-Skeleton Components**: Individual field-level skeleton components (30+ specialized components)
- **Granular Loading Hooks**: Field-level loading state management for profiles and data
- **Composite Skeletons**: Full component skeletons for posts, profiles, and pages
- **Conditional Loading**: Smart utilities for seamless skeleton-to-content transitions
- **Theme Integration**: Full integration with the cypherpunk dark theme system

---

## Key Features

### ✨ **Field-Level Granular Loading**
Individual profile fields (name, avatar, bio, etc.) can show skeleton loading while other fields display real data. This eliminates "Unknown User" placeholders and provides sophisticated loading states.

### 🎯 **Micro-Skeleton Components**
Over 30 specialized skeleton components for individual UI elements:
- `SkeletonName`, `SkeletonUsername`, `SkeletonBio`
- `SkeletonTimestamp`, `SkeletonNoteId`, `SkeletonNip05`
- `SkeletonInteractionCount`, `SkeletonLikeButton`, `SkeletonZapButton`
- `SkeletonFollowerCount`, `SkeletonVerificationBadge`
- `SkeletonLightningAddress`, `SkeletonWebsite`, `SkeletonRelayStatus`

### 🔧 **Enhanced Loading Hooks**
- `useGranularProfile`: Provides field-level loading states for profile data
- Individual field access with loading states (e.g., `loading.fields.name`)
- Smart caching and subscription management

### 🎨 **Conditional Rendering Utilities**
- `SkeletonOr`: Conditionally renders skeleton or real content
- `ConditionalSkeleton`: Smart skeleton display based on loading state
- Seamless transitions between loading and loaded states

---

## Design Philosophy

### Cypherpunk Aesthetic
- Matrix green accent integration with subtle loading animations
- Dark theme compatibility with proper contrast ratios
- Technical precision in spacing and proportions
- Consistent with the overall application design system

### User Experience
- **Perceived Performance**: Reduces perceived loading time through visual feedback
- **Content Awareness**: Skeletons match the structure of actual content
- **Natural Variation**: List skeletons vary in size for realistic appearance
- **Accessibility**: Proper ARIA labels and semantic structure

---

## Granular Loading Patterns

### Field-Level Profile Loading
The most powerful feature is granular profile loading where individual fields show skeleton loading while others display real data:

```typescript
import { useGranularProfile } from '@/hooks/useGranularProfile';
import { SkeletonName, SkeletonAvatar, SkeletonOr } from '@/components/common/MicroSkeletons';

function ProfileComponent({ pubkey }) {
  const { data: profile, loading } = useGranularProfile(pubkey);
  
  return (
    <div className="flex items-center gap-3">
      {/* Avatar shows skeleton while loading, real avatar when loaded */}
      <SkeletonOr
        loading={loading.fields.avatar}
        skeleton={<SkeletonAvatar size="md" />}
      >
        <Avatar src={profile.fields.avatar} />
      </SkeletonOr>
      
      {/* Name shows skeleton independently */}
      <SkeletonOr
        loading={loading.fields.name}
        skeleton={<SkeletonName variant="long" />}
      >
        <span className="font-bold">{profile.fields.name}</span>
      </SkeletonOr>
      
      {/* Bio could be loaded while name is still loading */}
      <SkeletonOr
        loading={loading.fields.bio}
        skeleton={<SkeletonBio lines={2} />}
      >
        <p className="text-sm">{profile.fields.bio}</p>
      </SkeletonOr>
    </div>
  );
}
```

### Post Card with Granular Loading
Posts can display content while user information shows skeleton loading:

```typescript
import { PostCard } from '@/components/post/PostCard';

// PostCard automatically uses granular loading
<PostCard 
  post={post} 
  // Post content displays immediately
  // User info shows skeleton loading per field
  // Interactions show skeleton until loaded
/>
```

### Page-Level Skeleton Loading
Full page skeletons for initial loading states:

```typescript
import { ProfileHeaderSkeleton, PostListSkeleton } from '@/components';

function ProfilePage({ pubkey }) {
  const { profile, loading } = useProfile(pubkey);
  
  if (loading && !profile) {
    return (
      <div>
        <ProfileHeaderSkeleton />
        <PostListSkeleton count={5} />
      </div>
    );
  }
  
  return (
    <div>
      <ProfileHeader pubkey={pubkey} />
      <PostList posts={posts} />
    </div>
  );
}
```

---

## Micro-Skeleton Components

### Text & Identity Skeletons
```typescript
import { 
  SkeletonName, 
  SkeletonUsername, 
  SkeletonBio,
  SkeletonNip05 
} from '@/components/common/MicroSkeletons';

// Name variations
<SkeletonName variant="short" />   // 60-90px width
<SkeletonName variant="medium" />  // 90-120px width  
<SkeletonName variant="long" />    // 120-160px width

// Username with @ symbol
<SkeletonUsername />

// Multi-line bio
<SkeletonBio lines={2} />

// NIP-05 verification
<SkeletonNip05 />
```

### Interaction Skeletons
```typescript
import { 
  SkeletonLikeButton,
  SkeletonZapButton,
  SkeletonReplyButton,
  SkeletonInteractionCount
} from '@/components/common/MicroSkeletons';

// Individual interaction buttons
<SkeletonLikeButton />
<SkeletonZapButton />
<SkeletonReplyButton />

// Interaction counts
<SkeletonInteractionCount />
```

### Specialized Nostr Skeletons
```typescript
import { 
  SkeletonLightningAddress,
  SkeletonVerificationBadge,
  SkeletonRelayStatus,
  SkeletonTimestamp 
} from '@/components/common/MicroSkeletons';

// Lightning address
<SkeletonLightningAddress />

// Verification badge
<SkeletonVerificationBadge />

// Relay connection status
<SkeletonRelayStatus />

// Timestamp
<SkeletonTimestamp />
```

---

## Base Components

### Skeleton
The foundational skeleton component for custom loading states.

```typescript
import { Skeleton } from '@/components';

// Basic usage
<Skeleton width="200px" height="20px" />

// With variants
<Skeleton variant="text" width="100%" height="1rem" />
<Skeleton variant="avatar" rounded="full" className="w-12 h-12" />
<Skeleton variant="button" rounded className="w-24 h-10" />
<Skeleton variant="card" width="100%" height="120px" />
```

**Props:**
- `width` - Width of skeleton element
- `height` - Height of skeleton element  
- `rounded` - Border radius (`boolean | 'full'`)
- `variant` - Predefined skeleton type (`'text' | 'avatar' | 'button' | 'card'`)
- `className` - Additional CSS classes

### SkeletonText
Multi-line text skeleton with automatic width variation.

```typescript
import { SkeletonText } from '@/components';

// Single line
<SkeletonText lines={1} />

// Multiple lines with natural variation
<SkeletonText lines={3} className="mb-4" />
```

**Props:**
- `lines` - Number of text lines to display (default: 1)
- `className` - Additional CSS classes

### SkeletonAvatar
Circular skeleton for profile images and avatars.

```typescript
import { SkeletonAvatar } from '@/components';

// Different sizes
<SkeletonAvatar size="xs" />  // 24px
<SkeletonAvatar size="sm" />  // 32px  
<SkeletonAvatar size="md" />  // 48px
<SkeletonAvatar size="lg" />  // 64px
<SkeletonAvatar size="xl" />  // 96px
```

**Props:**
- `size` - Avatar size (`'xs' | 'sm' | 'md' | 'lg' | 'xl'`)
- `className` - Additional CSS classes

### SkeletonButton
Button-shaped skeleton for action elements.

```typescript
import { SkeletonButton } from '@/components';

// Different sizes
<SkeletonButton size="sm" />  // 32px height
<SkeletonButton size="md" />  // 40px height
<SkeletonButton size="lg" />  // 48px height

// Custom width
<SkeletonButton size="md" className="w-32" />
```

**Props:**
- `size` - Button size (`'sm' | 'md' | 'lg'`)
- `className` - Additional CSS classes

---

## Post Components

### PostCardSkeleton
Skeleton for individual post cards with realistic structure.

```typescript
import { PostCardSkeleton } from '@/components';

// Basic post skeleton
<PostCardSkeleton />

// Variants
<PostCardSkeleton variant="compact" />
<PostCardSkeleton variant="default" />
<PostCardSkeleton variant="expanded" />

// With media
<PostCardSkeleton showMedia={true} />

// Without interactions
<PostCardSkeleton showInteractions={false} />
```

**Props:**
- `variant` - Size variant (`'compact' | 'default' | 'expanded'`)
- `showInteractions` - Show interaction buttons skeleton (default: true)
- `showMedia` - Show media placeholder (default: false)
- `className` - Additional CSS classes

### PostListSkeleton
Multiple post skeletons with natural variation.

```typescript
import { PostListSkeleton } from '@/components';

// Standard list
<PostListSkeleton count={5} />

// Custom variation
<PostListSkeleton count={10} className="space-y-4" />
```

**Props:**
- `count` - Number of post skeletons (default: 5)
- `className` - Additional CSS classes

### ThreadPostSkeleton
Indented skeleton for threaded conversations.

```typescript
import { ThreadPostSkeleton } from '@/components';

// Thread depth levels
<ThreadPostSkeleton depth={0} />  // Root level
<ThreadPostSkeleton depth={1} />  // First reply level
<ThreadPostSkeleton depth={2} />  // Second reply level
```

**Props:**
- `depth` - Thread depth for indentation (default: 0, max: 3)
- `className` - Additional CSS classes

---

## Profile Components

### ProfileCardSkeleton
Skeleton for profile cards with avatar, name, and stats.

```typescript
import { ProfileCardSkeleton } from '@/components';

// Basic profile skeleton
<ProfileCardSkeleton />

// Variants
<ProfileCardSkeleton variant="compact" />
<ProfileCardSkeleton variant="default" />
<ProfileCardSkeleton variant="header" />

// Options
<ProfileCardSkeleton showFollowButton={false} />
<ProfileCardSkeleton showStats={false} />
```

**Props:**
- `variant` - Size variant (`'compact' | 'default' | 'header'`)
- `showFollowButton` - Show follow button skeleton (default: true)
- `showStats` - Show follower stats skeleton (default: true)
- `className` - Additional CSS classes

### ProfileHeaderSkeleton
Large profile header with banner and detailed information.

```typescript
import { ProfileHeaderSkeleton } from '@/components';

<ProfileHeaderSkeleton className="mb-6" />
```

**Props:**
- `className` - Additional CSS classes

### ProfileListSkeleton
Multiple profile skeletons for lists and search results.

```typescript
import { ProfileListSkeleton } from '@/components';

// Compact list
<ProfileListSkeleton count={5} variant="compact" />

// Default list
<ProfileListSkeleton count={8} variant="default" />
```

**Props:**
- `count` - Number of profile skeletons (default: 5)
- `variant` - Profile variant (`'compact' | 'default'`)
- `className` - Additional CSS classes

---

## Data Components

### MessageSkeleton
Skeleton for direct message bubbles.

```typescript
import { MessageSkeleton } from '@/components';

// Other person's message
<MessageSkeleton isOwn={false} />

// Own message
<MessageSkeleton isOwn={true} />
```

**Props:**
- `isOwn` - Whether this is the user's own message (default: false)
- `className` - Additional CSS classes

### MessageListSkeleton
Conversation history with alternating message ownership.

```typescript
import { MessageListSkeleton } from '@/components';

<MessageListSkeleton count={8} />
```

**Props:**
- `count` - Number of message skeletons (default: 8)
- `className` - Additional CSS classes

### RelayStatusSkeleton
Skeleton for relay connection status cards.

```typescript
import { RelayStatusSkeleton } from '@/components';

<RelayStatusSkeleton />
```

**Props:**
- `className` - Additional CSS classes

### SearchResultSkeleton
Skeleton for search results (users or posts).

```typescript
import { SearchResultSkeleton } from '@/components';

// User search result
<SearchResultSkeleton type="user" />

// Post search result  
<SearchResultSkeleton type="post" />
```

**Props:**
- `type` - Type of search result (`'user' | 'post'`)
- `className` - Additional CSS classes

### StatsSkeleton
Skeleton for statistics and metrics displays.

```typescript
import { StatsSkeleton } from '@/components';

// Four-column stats
<StatsSkeleton columns={4} />

// Custom layout
<StatsSkeleton columns={3} className="justify-center" />
```

**Props:**
- `columns` - Number of stat columns (default: 4)
- `className` - Additional CSS classes

### ComposerSkeleton
Skeleton for post composition interface.

```typescript
import { ComposerSkeleton } from '@/components';

<ComposerSkeleton className="mb-6" />
```

**Props:**
- `className` - Additional CSS classes

---

## Navigation Components

### NavigationSkeleton
Skeleton for navigation items in various layouts.

```typescript
import { NavigationSkeleton } from '@/components';

// Sidebar navigation
<NavigationSkeleton variant="sidebar" items={5} />

// Tab navigation
<NavigationSkeleton variant="tabs" items={4} />

// Mobile navigation
<NavigationSkeleton variant="mobile" items={5} />
```

**Props:**
- `items` - Number of navigation items (default: 5)
- `variant` - Navigation style (`'sidebar' | 'mobile' | 'tabs'`)
- `className` - Additional CSS classes

---

## Usage Patterns

### Basic Implementation
Replace loading content with appropriate skeleton components:

```typescript
import { PostCardSkeleton, PostListSkeleton } from '@/components';

function PostList() {
  const { posts, loading } = usePosts();
  
  if (loading) {
    return <PostListSkeleton count={5} />;
  }
  
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### Conditional Loading
Show skeletons during specific loading states:

```typescript
function ProfilePage({ userId }: { userId: string }) {
  const { profile, loading } = useProfile(userId);
  
  return (
    <div>
      {loading ? (
        <ProfileHeaderSkeleton />
      ) : (
        <ProfileHeader profile={profile} />
      )}
    </div>
  );
}
```

### Progressive Loading
Show skeletons for different content types:

```typescript
function TimelinePage() {
  const { posts, loading: postsLoading } = usePosts();
  const { suggestions, loading: suggestionsLoading } = useSuggestions();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {postsLoading ? (
          <PostListSkeleton count={10} />
        ) : (
          <PostList posts={posts} />
        )}
      </div>
      
      <div>
        {suggestionsLoading ? (
          <ProfileListSkeleton count={5} variant="compact" />
        ) : (
          <SuggestionsList suggestions={suggestions} />
        )}
      </div>
    </div>
  );
}
```

### Error States
Combine with error handling:

```typescript
function PostList() {
  const { posts, loading, error } = usePosts();
  
  if (loading) return <PostListSkeleton count={5} />;
  if (error) return <ErrorMessage error={error} />;
  if (!posts.length) return <EmptyState />;
  
  return posts.map(post => <PostCard key={post.id} post={post} />);
}
```

---

## Customization

### Custom Skeleton Components
Create application-specific skeletons using base components:

```typescript
import { Skeleton, SkeletonText, SkeletonAvatar } from '@/components';

function CustomNotificationSkeleton() {
  return (
    <div className="flex items-start space-x-3 p-4 border-b border-border-primary">
      <SkeletonAvatar size="sm" />
      <div className="flex-1">
        <SkeletonText lines={1} className="mb-1" />
        <SkeletonText lines={2} />
        <Skeleton width="60px" height="0.875rem" className="mt-2 opacity-60" />
      </div>
      <Skeleton width="12px" height="12px" className="rounded-full" />
    </div>
  );
}
```

### Dynamic Skeleton Generation
Generate skeletons based on expected content:

```typescript
function DynamicPostSkeleton({ expectedLength }: { expectedLength: number }) {
  const lines = Math.ceil(expectedLength / 50); // Rough estimate
  
  return (
    <PostCardSkeleton 
      variant={lines > 3 ? 'expanded' : 'default'}
      showMedia={expectedLength > 200}
    />
  );
}
```

---

## Performance Considerations

### Skeleton Count
- Limit skeleton count based on viewport size
- Use intersection observer for infinite scroll skeletons
- Consider performance impact of too many animated elements

### Animation Performance
- Skeletons use CSS transforms and opacity for 60fps animations
- Animation respects `prefers-reduced-motion` user preference
- GPU acceleration through proper CSS properties

### Memory Management
- Clean up skeleton components when content loads
- Avoid keeping skeleton DOMs in memory unnecessarily
- Use React.memo for skeleton components that don't change

---

## Accessibility

### ARIA Labels
All skeleton components include proper ARIA labels:

```typescript
<div aria-label="Loading post..." role="status">
  <PostCardSkeleton />
</div>
```

### Screen Reader Support
- Skeleton components are announced as "Loading..."
- Proper semantic structure maintained
- Focus management during loading state transitions

### Reduced Motion
- Animation respects `prefers-reduced-motion: reduce`
- Fallback to static skeleton appearance
- Maintained visual hierarchy without animation

---

## Testing

### Visual Testing
Use the SkeletonDemo component for visual verification:

```typescript
import { SkeletonDemo } from '@/components';

// In development or testing environment
<SkeletonDemo />

// Access via component exports
import SkeletonDemo from '@/components/common/SkeletonDemo';
<SkeletonDemo className="my-custom-class" />
```

The SkeletonDemo component features:
- **Interactive Sections**: Tabbed interface showcasing different skeleton categories
- **Live Examples**: All skeleton components with various configurations
- **Usage Code**: Copy-paste ready code examples for implementation
- **Visual Verification**: Perfect for design system validation and QA

### Unit Testing
Test skeleton components in loading states:

```typescript
import { render, screen } from '@testing-library/react';
import { PostListSkeleton } from '@/components';

test('displays correct number of skeleton posts', () => {
  render(<PostListSkeleton count={3} />);
  
  const skeletons = screen.getAllByLabelText('Loading post...');
  expect(skeletons).toHaveLength(3);
});
```

### Integration Testing
Test skeleton to content transitions:

```typescript
test('shows skeleton while loading then content', async () => {
  render(<PostList />);
  
  // Initially shows skeleton
  expect(screen.getByLabelText('Loading post...')).toBeInTheDocument();
  
  // Content appears after loading
  await waitFor(() => {
    expect(screen.getByText('Post content')).toBeInTheDocument();
  });
  
  // Skeleton is removed
  expect(screen.queryByLabelText('Loading post...')).not.toBeInTheDocument();
});
```

---

## Best Practices

### Implementation
1. **Match Content Structure**: Skeleton should mirror the layout of actual content
2. **Consistent Timing**: Use consistent animation timing across components  
3. **Proper Fallbacks**: Always provide skeleton for loading states
4. **Performance First**: Optimize for smooth 60fps animations

### Design
1. **Natural Variation**: Vary skeleton sizes for realistic appearance
2. **Theme Consistency**: Follow cypherpunk theme guidelines
3. **Accessibility**: Ensure proper contrast and reduced motion support
4. **Progressive Enhancement**: Skeleton improves perceived performance

### Maintenance
1. **Update Together**: Keep skeletons in sync with actual component changes
2. **Regular Testing**: Test skeletons across different screen sizes
3. **Performance Monitoring**: Monitor animation performance impact
4. **User Feedback**: Gather feedback on loading experience

---

## Cross-Documentation References

This skeleton system is comprehensively documented across multiple project files:

- **[tech-stack.md](./tech-stack.md)**: Technical implementation details and best practices
- **[ui-rules.md](./ui-rules.md)**: Design principles and interaction patterns
- **[theme-rules.md](./theme-rules.md)**: Theme integration and animation specifications
- **[skeleton-system.md](./skeleton-system.md)**: Complete API reference and usage guide (this document)

Additional resources:
- **SkeletonDemo Component**: Interactive showcase of all skeleton components
- **Source Code**: All skeleton components in `src/components/` with full TypeScript support

---

This skeleton system provides a comprehensive foundation for excellent loading states throughout the snstr-client-test application, maintaining the cypherpunk aesthetic while ensuring superior user experience during content loading. 