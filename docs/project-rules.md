# snstr-client-test - Project Rules & Development Standards

This document establishes the comprehensive rules, conventions, and standards for the snstr-client-test codebase. These guidelines ensure consistency, maintainability, and AI-compatibility across all development activities.

---

## AI-First Codebase Principles

### Core Philosophy
- **Modular Architecture**: Every component, utility, and feature should be self-contained with clear interfaces
- **Scalable Design**: Code structure should support rapid feature addition without major refactoring
- **AI-Compatible**: File structure and naming should be immediately understandable to AI development tools
- **Documentation-Driven**: Code should be self-documenting with comprehensive comments and clear naming

### File Size Constraints
- **Maximum 500 Lines**: No file should exceed 500 lines to ensure AI compatibility
- **Logical Splitting**: Large files should be split by logical concerns (components, utilities, types)
- **Single Responsibility**: Each file should have one clear purpose and responsibility
- **Cohesive Organization**: Related functionality should be grouped together but not overloaded

---

## Directory Structure

### Root Level Organization
```
snstr-client-test/
├── docs/                    # Project documentation
├── public/                  # Static assets
├── src/                     # Source code
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page-level components
│   ├── features/           # Feature-specific modules
│   ├── store/              # Redux store configuration
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── constants/          # Application constants
│   ├── styles/             # Global styles and theme
│   └── assets/             # Images, icons, media
├── tests/                  # Test files
└── config/                 # Configuration files
```

### Source Code Organization (`src/`)

#### **Components Directory** (`src/components/`)
```
components/
├── ui/                     # shadcn/ui components and customizations
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.types.ts
│   │   └── index.ts
│   └── Input/
│       ├── Input.tsx
│       ├── Input.types.ts
│       └── index.ts
├── layout/                 # Layout components
│   ├── Header/
│   ├── Sidebar/
│   ├── MobileNavigation/
│   └── PageLayout/
├── post/                   # Post-related components
│   ├── PostCard/
│   ├── PostComposer/
│   ├── PostThread/
│   └── PostInteractions/
├── profile/                # Profile components
│   ├── ProfileCard/
│   ├── ProfileHeader/
│   └── ProfileEditor/
└── common/                 # Common reusable components
    ├── Avatar/
    ├── LoadingSpinner/
    ├── ErrorBoundary/
    └── Modal/
```

#### **Pages Directory** (`src/pages/`)
```
pages/
├── Timeline/
│   ├── TimelinePage.tsx
│   ├── TimelinePage.types.ts
│   ├── TimelinePage.hooks.ts
│   └── index.ts
├── Profile/
├── Messages/
├── Settings/
├── Search/
└── Compose/
```

#### **Features Directory** (`src/features/`)
```
features/
├── auth/                   # Authentication feature
│   ├── components/
│   ├── hooks/
│   ├── store/
│   ├── types/
│   ├── utils/
│   └── index.ts
├── nostr/                  # Nostr protocol integration
│   ├── client/
│   ├── events/
│   ├── relays/
│   ├── keys/
│   └── index.ts
├── posts/                  # Post management
├── messaging/              # Direct messaging
├── zaps/                   # Lightning zaps
└── relays/                 # Relay management
```

#### **Store Directory** (`src/store/`)
```
store/
├── slices/                 # Redux Toolkit slices
│   ├── authSlice.ts
│   ├── postsSlice.ts
│   ├── profilesSlice.ts
│   └── relaysSlice.ts
├── middleware/             # Custom middleware
├── selectors/              # Reselect selectors
├── types/                  # Store-related types
└── index.ts                # Store configuration
```

---

## File Naming Conventions

### General Rules
- **PascalCase**: React components, TypeScript interfaces, classes
- **camelCase**: Functions, variables, hooks, utilities
- **kebab-case**: File names, directory names, CSS classes
- **UPPER_SNAKE_CASE**: Constants, environment variables
- **Descriptive Names**: Names should clearly indicate purpose and content

### Component Files
```typescript
// Component files
ProfileCard.tsx              // Main component
ProfileCard.types.ts         // TypeScript interfaces
ProfileCard.hooks.ts         // Component-specific hooks
ProfileCard.utils.ts         // Component utilities
ProfileCard.test.tsx         // Unit tests
ProfileCard.stories.tsx      // Storybook stories (if used)
index.ts                     // Export file
```

### Feature Module Files
```typescript
// Feature modules
authClient.ts               // Main functionality
authTypes.ts               // Type definitions
authHooks.ts               // React hooks
authUtils.ts               // Utility functions
authConstants.ts           // Constants
authSelectors.ts           // Redux selectors
index.ts                   // Public API exports
```

### Utility and Hook Files
```typescript
// Utilities
formatDate.ts              // Single-purpose utilities
validateEmail.ts
parseNostrEvent.ts

// Hooks
useNostrAuth.ts           // Custom hooks
useRelayConnection.ts
usePostComposer.ts
```

---

## Code Organization Standards

### File Structure Template
```typescript
/**
 * @fileoverview Brief description of the file's purpose and functionality
 * @author Development Team
 * @since Version 1.0.0
 */

// 1. External library imports
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// 2. Internal imports - features
import { useNostrAuth } from '@/features/auth';
import { selectCurrentUser } from '@/store/selectors';

// 3. Internal imports - components
import { Button } from '@/components/ui';
import { PostCard } from '@/components/post';

// 4. Internal imports - utilities and types
import { formatTimestamp } from '@/utils/date';
import type { Post, User } from '@/types';

// 5. Type definitions (if small, otherwise separate file)
interface ComponentProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
}

// 6. Constants (if component-specific)
const DEFAULT_POSTS_PER_PAGE = 20;

// 7. Main component/function
export function ComponentName({ posts, onPostClick }: ComponentProps) {
  // Component implementation
}

// 8. Default export (if applicable)
export default ComponentName;
```

### Component Architecture Standards

#### **React Component Structure**
```typescript
/**
 * @fileoverview PostCard component for displaying individual posts
 * Handles post rendering, interactions, and state management
 */

import React, { memo, useCallback } from 'react';
import type { Post, User } from '@/types';

interface PostCardProps {
  /** The post data to display */
  post: Post;
  /** Current user information for interaction permissions */
  currentUser?: User;
  /** Callback fired when user clicks on the post */
  onPostClick?: (post: Post) => void;
  /** Callback fired when user likes the post */
  onLike?: (postId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PostCard component displays individual posts with interaction capabilities
 * Supports likes, reposts, replies, and zaps based on user authentication
 */
export const PostCard = memo(function PostCard({
  post,
  currentUser,
  onPostClick,
  onLike,
  className
}: PostCardProps) {
  // Component implementation
});
```

#### **Custom Hook Structure**
```typescript
/**
 * @fileoverview Custom hook for managing Nostr authentication state
 * Provides authentication methods and current user information
 */

import { useState, useEffect, useCallback } from 'react';
import type { User, AuthState } from '@/types';

interface UseNostrAuthReturn {
  /** Current authentication state */
  authState: AuthState;
  /** Current authenticated user */
  user: User | null;
  /** Login function using NIP-07 extension */
  login: () => Promise<void>;
  /** Logout function */
  logout: () => void;
  /** Whether authentication is in progress */
  isLoading: boolean;
  /** Any authentication error */
  error: string | null;
}

/**
 * Custom hook for managing Nostr authentication
 * Handles NIP-07 browser extension integration and user state
 * 
 * @returns Authentication state and methods
 */
export function useNostrAuth(): UseNostrAuthReturn {
  // Hook implementation
}
```

---

## Documentation Requirements

### File Headers
Every file must start with a comprehensive header comment:

```typescript
/**
 * @fileoverview Brief description of the file's purpose
 * @module ModuleName (if applicable)
 * @author Development Team
 * @since Version 1.0.0
 * @example
 * // Usage example
 * import { ComponentName } from './ComponentName';
 */
```

### Function Documentation
All functions must have JSDoc comments:

```typescript
/**
 * Formats a Unix timestamp into a human-readable relative time string
 * 
 * @param timestamp - Unix timestamp in seconds
 * @param options - Formatting options
 * @param options.includeTime - Whether to include time in output
 * @param options.shortFormat - Use abbreviated format (e.g., "2h" vs "2 hours")
 * @returns Formatted time string (e.g., "2 hours ago", "3 days ago")
 * 
 * @example
 * formatRelativeTime(1640995200, { shortFormat: true })
 * // Returns: "2h ago"
 * 
 * @throws {Error} When timestamp is invalid or negative
 */
function formatRelativeTime(
  timestamp: number,
  options: {
    includeTime?: boolean;
    shortFormat?: boolean;
  } = {}
): string {
  // Implementation
}
```

### Component Documentation
React components require detailed prop documentation:

```typescript
interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button is in loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}
```

---

## State Management Patterns

### Redux Toolkit Slice Structure
```typescript
/**
 * @fileoverview Redux slice for managing post-related state
 * Handles timeline posts, user posts, and post interactions
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Post, PostsState, LoadPostsOptions } from './types';

// Async thunks
export const loadTimelinePosts = createAsyncThunk(
  'posts/loadTimeline',
  async (options: LoadPostsOptions) => {
    // Implementation
  }
);

// Initial state
const initialState: PostsState = {
  timeline: [],
  userPosts: {},
  loading: false,
  error: null,
};

// Slice definition
export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPost: (state, action: PayloadAction<Post>) => {
      // Implementation
    },
    updatePost: (state, action: PayloadAction<Partial<Post> & { id: string }>) => {
      // Implementation
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTimelinePosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadTimelinePosts.fulfilled, (state, action) => {
        state.loading = false;
        state.timeline = action.payload;
      });
  },
});

export const { addPost, updatePost } = postsSlice.actions;
export default postsSlice.reducer;
```

### Selector Patterns
```typescript
/**
 * @fileoverview Selectors for post-related state
 * Provides memoized selectors for efficient state access
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/types';

// Base selectors
const selectPostsState = (state: RootState) => state.posts;

// Memoized selectors
export const selectTimelinePosts = createSelector(
  [selectPostsState],
  (posts) => posts.timeline
);

export const selectPostById = createSelector(
  [selectPostsState, (state: RootState, postId: string) => postId],
  (posts, postId) => posts.timeline.find(post => post.id === postId)
);

export const selectUserPosts = createSelector(
  [selectPostsState, (state: RootState, userId: string) => userId],
  (posts, userId) => posts.userPosts[userId] || []
);
```

---

## Styling and Theme Conventions

### CSS-in-JS Patterns
```typescript
/**
 * @fileoverview Styled components and theme utilities
 * Provides consistent styling patterns using CSS variables
 */

import { cn } from '@/utils/cn';

// Utility function for conditional classes
export function getButtonClasses(
  variant: 'primary' | 'secondary' | 'ghost',
  size: 'sm' | 'md' | 'lg',
  disabled: boolean
): string {
  return cn(
    'btn-base',
    {
      'btn-primary': variant === 'primary',
      'btn-secondary': variant === 'secondary',
      'btn-ghost': variant === 'ghost',
      'btn-sm': size === 'sm',
      'btn-md': size === 'md',
      'btn-lg': size === 'lg',
      'btn-disabled': disabled,
    }
  );
}
```

### Theme Integration
```typescript
/**
 * @fileoverview Theme configuration and utilities
 * Manages dark cypherpunk theme implementation
 */

export const themeConfig = {
  colors: {
    primary: 'var(--bg-primary)',
    secondary: 'var(--bg-secondary)',
    accent: 'var(--accent-primary)',
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
    },
  },
  spacing: {
    xs: 'var(--space-1)',
    sm: 'var(--space-2)',
    md: 'var(--space-4)',
    lg: 'var(--space-6)',
    xl: 'var(--space-8)',
  },
} as const;
```

---

## Error Handling Standards

### Error Boundary Pattern
```typescript
/**
 * @fileoverview Error boundary for graceful error handling
 * Catches and displays errors in React component tree
 */

import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in child tree
 * Logs errors and displays fallback UI instead of crashing the app
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}
```

### Async Error Handling
```typescript
/**
 * @fileoverview Utility for handling async operations with error management
 * Provides consistent error handling patterns across the application
 */

interface AsyncResult<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

/**
 * Wrapper for async operations that provides consistent error handling
 * 
 * @param asyncFn - Async function to execute
 * @param errorMessage - Custom error message
 * @returns Result with data, error, and loading state
 */
export async function handleAsync<T>(
  asyncFn: () => Promise<T>,
  errorMessage = 'An error occurred'
): Promise<AsyncResult<T>> {
  try {
    const data = await asyncFn();
    return { data, loading: false };
  } catch (error) {
    console.error(errorMessage, error);
    return { 
      error: error instanceof Error ? error.message : errorMessage,
      loading: false 
    };
  }
}
```

---

## Testing Standards

### Unit Test Structure
```typescript
/**
 * @fileoverview Unit tests for PostCard component
 * Tests rendering, interactions, and edge cases
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from './PostCard';
import type { Post, User } from '@/types';

// Mock data
const mockPost: Post = {
  id: '1',
  content: 'Test post content',
  author: 'test-user',
  createdAt: 1640995200,
  likes: 0,
  reposts: 0,
  replies: 0,
};

const mockUser: User = {
  id: 'current-user',
  name: 'Current User',
  publicKey: 'test-public-key',
};

describe('PostCard', () => {
  it('renders post content correctly', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test post content')).toBeInTheDocument();
  });

  it('handles like button click', () => {
    const onLike = jest.fn();
    render(<PostCard post={mockPost} currentUser={mockUser} onLike={onLike} />);
    
    fireEvent.click(screen.getByRole('button', { name: /like/i }));
    expect(onLike).toHaveBeenCalledWith('1');
  });

  it('displays correct timestamp', () => {
    render(<PostCard post={mockPost} />);
    // Test timestamp formatting
  });
});
```

### Integration Test Patterns
```typescript
/**
 * @fileoverview Integration tests for authentication flow
 * Tests complete user authentication scenarios
 */

import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AuthProvider } from '@/features/auth';
import { LoginPage } from '@/pages/Login';

describe('Authentication Integration', () => {
  it('completes full login flow', async () => {
    render(
      <Provider store={store}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </Provider>
    );

    // Test complete authentication flow
  });
});
```

---

## Performance Guidelines

### Code Splitting Patterns
```typescript
/**
 * @fileoverview Lazy loading configuration for route-based code splitting
 * Optimizes initial bundle size by loading pages on demand
 */

import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/common';

// Lazy load page components
const TimelinePage = lazy(() => import('@/pages/Timeline'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const MessagesPage = lazy(() => import('@/pages/Messages'));

/**
 * Wrapper component for lazy-loaded routes
 * Provides loading state and error handling
 */
export function LazyRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
}
```

### Memoization Patterns
```typescript
/**
 * @fileoverview Memoization utilities for performance optimization
 * Prevents unnecessary re-renders and computations
 */

import { memo, useMemo, useCallback } from 'react';

// Component memoization
export const OptimizedComponent = memo(function OptimizedComponent({ 
  data, 
  onAction 
}: ComponentProps) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => processItem(item));
  }, [data]);

  // Memoize callback functions
  const handleClick = useCallback((id: string) => {
    onAction(id);
  }, [onAction]);

  return (
    // Component JSX
  );
});
```

---

## Import and Export Conventions

### Module Exports
```typescript
/**
 * @fileoverview Public API exports for auth feature
 * Provides clean interface for external consumption
 */

// Named exports for utilities
export { loginUser, logoutUser } from './authClient';
export { useNostrAuth } from './authHooks';
export { validatePublicKey } from './authUtils';

// Type exports
export type { 
  AuthState, 
  User, 
  LoginOptions,
  AuthError 
} from './authTypes';

// Default export for main functionality
export { default as AuthProvider } from './AuthProvider';
```

### Import Organization
```typescript
// 1. External libraries (alphabetical)
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';

// 2. Feature imports (alphabetical by feature)
import { useNostrAuth } from '@/features/auth';
import { usePostInteractions } from '@/features/posts';
import { useRelayConnection } from '@/features/relays';

// 3. Component imports (alphabetical)
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// 4. Utility and type imports
import { cn } from '@/utils/cn';
import { formatTimestamp } from '@/utils/date';
import type { Post, User } from '@/types';
```

---

## Development Workflow Standards

### Git Commit Conventions
```
feat: add new post composer component
fix: resolve relay connection timeout issue
docs: update authentication flow documentation
style: apply consistent button styling
refactor: extract post utilities to separate module
test: add unit tests for post interactions
chore: update dependencies and build configuration
```

### Branch Naming
```
feature/post-composer
bugfix/relay-connection-timeout
hotfix/authentication-error
docs/api-documentation
refactor/state-management
```

### Code Review Checklist
- [ ] File adheres to 500-line limit
- [ ] All functions have JSDoc comments
- [ ] TypeScript interfaces are properly defined
- [ ] Components are properly memoized where appropriate
- [ ] Error handling is implemented
- [ ] Tests are included for new functionality
- [ ] Import statements are organized correctly
- [ ] Naming conventions are followed
- [ ] Performance considerations are addressed
- [ ] Accessibility requirements are met

---

## Configuration Files

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/features/*": ["src/features/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/store/*": ["src/store/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### ESLint Configuration
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // File and function documentation
    'require-jsdoc': ['error', {
      'require': {
        'FunctionDeclaration': true,
        'MethodDefinition': true,
        'ClassDeclaration': true,
        'ArrowFunctionExpression': true,
        'FunctionExpression': true
      }
    }],
    // Naming conventions
    '@typescript-eslint/naming-convention': [
      'error',
      {
        'selector': 'interface',
        'format': ['PascalCase'],
        'prefix': ['I']
      },
      {
        'selector': 'typeAlias',
        'format': ['PascalCase']
      },
      {
        'selector': 'variable',
        'format': ['camelCase', 'UPPER_CASE']
      }
    ],
    // File organization
    'import/order': ['error', {
      'groups': [
        ['builtin', 'external'],
        ['internal'],
        ['parent', 'sibling', 'index']
      ],
      'alphabetize': { 'order': 'asc' }
    }]
  }
};
```

---

## Summary

These project rules establish a comprehensive framework for developing the snstr-client-test application with consistency, maintainability, and AI-compatibility at its core. Key principles include:

1. **Modular Architecture**: Clear separation of concerns with well-defined interfaces
2. **Comprehensive Documentation**: Every file, function, and component thoroughly documented
3. **Consistent Naming**: Predictable naming patterns across all code elements
4. **Performance Optimization**: Built-in patterns for code splitting and memoization
5. **Error Resilience**: Comprehensive error handling and recovery mechanisms
6. **Testing Standards**: Structured approach to unit and integration testing
7. **Type Safety**: Full TypeScript coverage with proper interface definitions

Following these rules ensures that the codebase remains readable, maintainable, and easily extensible by both human developers and AI development tools, supporting the project's goal of becoming a reference implementation for Nostr client development. 