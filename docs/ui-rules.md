# snstr-client-test - UI Rules & Design Principles

This document establishes the foundational design principles for the snstr-client-test application, ensuring a consistent, accessible, and compelling user experience across all platforms and interactions.

---

## Design Philosophy

### Core Principles

**Cypherpunk Minimalism**: Embrace the raw, honest aesthetic of decentralized technology while maintaining usability for mainstream users. Every element should serve a purpose—no decoration for decoration's sake.

**Content-First Design**: Posts, conversations, and user interactions are the primary focus. The interface should fade into the background, allowing content to shine.

**Technical Transparency**: Users should understand what's happening behind the scenes—relay connections, encryption status, and network activity should be visible but not intrusive.

**Inclusive Accessibility**: Despite the technical aesthetic, the application must be usable by Twitter migrants and non-technical users seeking privacy alternatives.

---

## Responsive Design Strategy

### Desktop-First Approach
- **Primary Design Target**: 1920x1080 and 1440x900 resolutions
- **Sidebar Navigation**: Persistent left sidebar with full labels and icons
- **Multi-Column Layouts**: Utilize horizontal space for richer information density
- **Hover States**: Rich hover interactions with subtle animations and tooltips
- **Keyboard Navigation**: Full keyboard accessibility for power users

### Mobile Optimization
- **Touch-First Interactions**: 44px minimum tap targets, generous spacing
- **Bottom Navigation**: Tab bar for primary navigation functions
- **Swipe Gestures**: Intuitive swipe actions for common interactions
- **Single-Column Focus**: Simplified layouts that prioritize content flow
- **Thumb-Friendly**: Critical actions within thumb reach zones

### Breakpoint Strategy
```css
/* Mobile First Breakpoints */
sm: 640px   /* Large phones, small tablets */
md: 768px   /* Tablets, small laptops */
lg: 1024px  /* Laptops, small desktops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

---

## Iconographic Design System

### Icon Philosophy
- **Symbolic Communication**: Icons should convey meaning without text labels
- **Consistent Visual Language**: All icons follow the same stylistic approach
- **Scalable Recognition**: Icons work at multiple sizes (16px to 48px)
- **Cultural Clarity**: Avoid ambiguous symbols that may confuse users

### Icon Categories

#### **Navigation Icons**
- **Home**: House outline for Following feed
- **Compass**: Discovery/Explore feed
- **Search**: Magnifying glass for user/content search
- **Edit**: Pencil/plus for compose actions
- **MessageCircle**: Direct messages
- **Settings**: Gear for configuration
- **User**: Profile access

#### **Interaction Icons**
- **Heart**: Like/reaction (outline when inactive, filled when active)
- **Zap**: Lightning bolt for Bitcoin zaps
- **MessageSquare**: Reply/comment
- **Repeat**: Repost/share
- **MoreHorizontal**: Additional options menu
- **Share**: External sharing options

#### **Status Icons**
- **Wifi**: Relay connection status
- **Shield**: Encryption/security indicators
- **CheckCircle**: Verification badges (NIP-05)
- **AlertTriangle**: Warnings and errors
- **Clock**: Timestamp and scheduling
- **Eye**: Visibility settings

#### **Technical Icons**
- **Key**: Cryptographic operations
- **Server**: Relay management
- **Link**: URL/connection indicators
- **Code**: Developer features
- **Terminal**: Advanced/technical modes
- **Lock**: Privacy/encryption states

### Icon Usage Rules

#### **Sizing Standards**
- **xs**: 12px - Inline status indicators
- **sm**: 16px - Button icons, toolbar actions
- **md**: 20px - Primary navigation, post interactions
- **lg**: 24px - Headers, prominent actions
- **xl**: 32px - Profile avatars, large buttons
- **2xl**: 48px - Hero sections, empty states

#### **Color Applications**
- **Primary**: White (#ffffff) for active states
- **Secondary**: Gray (#a0a0a0) for inactive states
- **Accent**: Matrix Green (#00ff41) for interactive elements
- **Success**: Green (#00ff00) for positive states
- **Warning**: Orange (#ffaa00) for attention states
- **Error**: Red (#ff3366) for problems

#### **Animation Guidelines**
- **Hover**: 0.2s ease-in-out transition
- **Click**: 0.1s scale transformation (0.95x)
- **Loading**: Subtle pulse or rotation
- **State Change**: 0.3s color/opacity transition

---

## Layout & Spacing System

### Grid Foundation
- **Base Unit**: 4px for mathematical precision
- **Spacing Scale**: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- **Component Padding**: 16px minimum for touch targets
- **Section Spacing**: 32px between major sections
- **Page Margins**: 24px mobile, 48px desktop

### Component Hierarchy

#### **Post Cards**
- **Compact Design**: Minimal padding, maximum content
- **Clear Boundaries**: Subtle borders or background differentiation
- **Interaction Zones**: Clearly defined areas for taps/clicks
- **Information Hierarchy**: Username > content > metadata > actions

#### **Navigation Layout**
- **Desktop Sidebar**: 240px width, fixed position
- **Mobile Bottom Tabs**: 80px height, 5 primary actions
- **Header**: 64px height, consistent across all pages
- **Responsive Behavior**: Collapsible sidebar on medium screens

#### **Form Design**
- **Input Fields**: 44px height for touch accessibility
- **Button Hierarchy**: Primary (filled), Secondary (outline), Tertiary (text)
- **Validation States**: Clear error/success indicators
- **Progressive Disclosure**: Show advanced options only when needed

---

## Typography & Content Hierarchy

### Font Strategy
- **Primary**: Inter (clean, readable sans-serif)
- **Monospace**: JetBrains Mono (technical elements, keys, hashes)
- **Fallbacks**: System fonts for reliability

### Text Hierarchy
```css
/* Display Text */
h1: 32px font-bold     /* Page titles */
h2: 24px font-semibold /* Section headers */
h3: 20px font-medium   /* Subsection headers */

/* Body Text */
body: 16px font-normal     /* Post content, descriptions */
small: 14px font-normal    /* Metadata, secondary info */
xs: 12px font-normal       /* Timestamps, fine print */

/* Interactive Text */
button: 14px font-medium   /* Button labels */
link: 16px font-medium     /* Clickable links */
```

### Content Guidelines
- **Line Height**: 1.5x for body text, 1.2x for headings
- **Paragraph Spacing**: 16px between paragraphs
- **Link Styling**: Matrix green color with subtle underline on hover
- **Emphasis**: Bold for importance, monospace for technical terms

---

## Interaction Design Patterns

### Feedback Systems
- **Optimistic Updates**: Immediate visual feedback for user actions
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: Clear, actionable error messages
- **Success Confirmation**: Subtle animations and color changes

### Touch & Gestures
- **Tap**: Primary interaction for all elements
- **Long Press**: Context menus and additional options
- **Swipe**: Navigation between sections (mobile)
- **Pull to Refresh**: Update feeds and content
- **Pinch to Zoom**: Image viewing (if applicable)

### Accessibility Features
- **Focus Indicators**: Clear keyboard navigation
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: WCAG AA compliance minimum
- **Reduced Motion**: Respect user preferences
- **Semantic HTML**: Proper heading hierarchy and landmarks

---

## Real-Time Interface Patterns

### Live Updates
- **Subtle Animation**: New posts fade in smoothly
- **Connection Status**: Always visible relay health
- **Typing Indicators**: Show when others are composing
- **Presence Indicators**: Online/offline status where relevant

### State Management
- **Optimistic UI**: Show changes immediately, handle errors gracefully
- **Conflict Resolution**: Clear indication when conflicts occur
- **Sync Status**: Users understand when data is synchronizing
- **Offline Capability**: Graceful degradation when disconnected

### Notification System
- **Non-Intrusive**: Subtle badges and indicators
- **Contextual**: Notifications appear where relevant
- **Dismissible**: Users can clear notifications easily
- **Persistent**: Important notifications remain until acknowledged

---

## Mobile-Specific Considerations

### Touch Optimization
- **Target Size**: 44px minimum for all interactive elements
- **Spacing**: 8px minimum between touch targets
- **Thumb Zones**: Primary actions within easy reach
- **Edge Gestures**: Avoid conflicts with system gestures

### Performance Priorities
- **Fast First Paint**: Critical content loads quickly
- **Smooth Scrolling**: 60fps timeline scrolling
- **Efficient Animations**: Use transform and opacity only
- **Memory Management**: Virtualized lists for long feeds

### Platform Integration
- **Status Bar**: Proper styling for light/dark themes
- **Safe Areas**: Respect device-specific safe zones
- **Keyboard Handling**: Proper input focus and scrolling
- **Orientation**: Graceful rotation handling

---

## Error & Empty States

### Error Handling
- **Clear Language**: Non-technical error messages
- **Actionable Solutions**: Tell users what they can do
- **Visual Hierarchy**: Errors stand out without being alarming
- **Recovery Options**: Easy ways to retry or get help

### Empty States
- **Encouraging**: Motivate user action with positive messaging
- **Instructional**: Guide users toward their first actions
- **Consistent**: Same patterns across all empty states
- **Branded**: Maintain cypherpunk aesthetic even in empty states

### Loading States

#### Skeleton System Design
The skeleton loading system provides high-quality loading states that maintain the cypherpunk aesthetic while ensuring excellent user experience during content loading.

**Design Principles:**
- **Content Awareness**: Skeletons mirror the exact structure of actual content
- **Natural Variation**: List skeletons vary in size and content to appear realistic
- **Cypherpunk Aesthetic**: Matrix green animations with dark theme optimization
- **Performance First**: GPU-accelerated animations at 60fps
- **Accessibility**: Full ARIA support with reduced motion compliance

**Skeleton Components:**

**Base Components:**
- **Skeleton**: Foundational component with customizable dimensions and variants
- **SkeletonText**: Multi-line text with automatic width variation for natural appearance
- **SkeletonAvatar**: Circular profile image skeletons in 5 sizes (xs, sm, md, lg, xl)
- **SkeletonButton**: Button-shaped skeletons in 3 sizes (sm, md, lg)

**Specialized Components:**
- **PostCardSkeleton**: Individual post cards with variants (compact/default/expanded)
- **ProfileCardSkeleton**: Profile cards with avatars, stats, and follow buttons
- **MessageSkeleton**: Direct message bubbles for conversations
- **RelayStatusSkeleton**: Relay connection status displays
- **SearchResultSkeleton**: User and post search results
- **NavigationSkeleton**: Sidebar, mobile, and tab navigation states

**Animation Guidelines:**
- **Duration**: 1.5s infinite loop with smooth gradient transitions
- **Reduced Motion**: Static appearance for users with motion sensitivities
- **Timing**: Consistent animation timing across all skeleton components
- **Performance**: Use CSS transforms and opacity for optimal performance

**Implementation Patterns:**
- **Conditional Rendering**: `{loading ? <SkeletonComponent /> : <ActualComponent />}`
- **Progressive Loading**: Show skeletons for different content types as they load
- **List Variations**: Use varied skeleton sizes for realistic list appearance
- **Error Fallbacks**: Combine skeleton states with error handling

**Progressive Loading**: Load critical content first
**Timeout Handling**: Clear feedback when operations take too long
**Cancellation**: Allow users to cancel long operations

---

## Accessibility Standards

### WCAG Compliance
- **AA Standard**: Minimum compliance level
- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: All functionality accessible via keyboard
- **Screen Reader**: Proper semantic markup and ARIA labels

### Inclusive Design
- **Language**: Simple, clear language avoiding jargon
- **Cognitive Load**: Minimize decisions required from users
- **Error Prevention**: Design to prevent errors before they occur
- **Flexible Interaction**: Support multiple ways to complete tasks

### Technical Accessibility
- **Focus Management**: Logical tab order and visible focus
- **Headings**: Proper heading hierarchy (h1, h2, h3)
- **Labels**: All form inputs have descriptive labels
- **Alternative Text**: Meaningful alt text for images and icons

---

## Performance Guidelines

### Loading Priorities
1. **Critical**: Navigation, authentication status
2. **Important**: Timeline content, user profiles
3. **Nice-to-have**: Images, rich media, analytics

### Optimization Strategies
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Images and non-critical components
- **Caching**: Aggressive caching for static assets
- **Compression**: Gzip/Brotli for all text assets

### Mobile Performance
- **Bundle Size**: Target <200kb initial bundle
- **Image Optimization**: WebP format with fallbacks
- **Network Awareness**: Adapt to connection quality
- **Battery Consideration**: Minimize CPU-intensive operations

---

## Implementation Notes

### shadcn/ui Integration
- **Component Customization**: Override default styles while maintaining accessibility
- **Theme Integration**: Ensure cypherpunk theme works with all components
- **Responsive Behavior**: Verify mobile performance of all components
- **Dark Mode**: All components should support dark theme by default

### Tailwind CSS Usage
- **Utility Classes**: Prefer utility classes over custom CSS
- **Responsive Modifiers**: Use mobile-first responsive design
- **Custom Components**: Create component classes for repeated patterns
- **Purging**: Ensure unused styles are removed in production

### React Patterns
- **Component Composition**: Small, focused components
- **State Management**: Clear separation of concerns with Redux Toolkit
- **Error Boundaries**: Graceful error handling at component level
- **Performance**: Memoization and lazy loading where appropriate

These UI rules provide the foundation for creating a consistent, accessible, and compelling user experience that honors the cypherpunk aesthetic while remaining usable for mainstream users transitioning from traditional social media platforms. 