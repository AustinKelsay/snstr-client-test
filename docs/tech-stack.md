# snstr-client-test - Tech Stack Recommendations

This document outlines technology recommendations for building the snstr-client-test application. Based on the project requirements for a Twitter-like Nostr client that works seamlessly across mobile and desktop, each technology choice is presented with an industry standard and popular alternative.

---

## Confirmed Technologies

### Already Selected
- **TypeScript** - Type-safe JavaScript for better development experience
- **React** - Component-based UI library for building user interfaces
- **snstr** - Nostr protocol library (linked locally from attached documentation)
- **shadcn/ui** - High-quality, accessible React components built on Radix UI

---

## Frontend Framework & Architecture

### Meta Framework
**Industry Standard: Next.js 14 (App Router)**
- **Pros**: Full-stack React framework, excellent developer experience, built-in optimizations, SSR/SSG support, API routes, deployment optimizations
- **Cons**: Learning curve for App Router, may be overkill for client-only app, adds complexity
- **Use Case**: When you need SSR, SEO, or full-stack capabilities

**Popular Alternative: Vite + React**
- **Pros**: Blazing fast development, simple setup, excellent TypeScript support, smaller bundle size, perfect for SPAs
- **Cons**: Requires more manual configuration, no built-in SSR, separate backend needed
- **Use Case**: Client-side applications, rapid prototyping, when you want minimal overhead

**Recommendation**: **Vite + React** - Perfect fit for this client-side Nostr application. Fast development, simple deployment, and no SSR needed since the app relies on browser extensions.

---

## UI & Styling

### CSS Framework
**Industry Standard: Tailwind CSS**
- **Pros**: Utility-first approach, excellent with shadcn/ui, consistent design system, responsive design utilities
- **Cons**: Large class names, learning curve, potential bloat
- **Use Case**: Rapid UI development, design system consistency

**Popular Alternative: Styled Components**
- **Pros**: CSS-in-JS, component-scoped styles, dynamic styling based on props
- **Cons**: Runtime overhead, larger bundle size, complexity
- **Use Case**: Highly dynamic styling, theme switching

**Recommendation**: **Tailwind CSS** - Perfect companion to shadcn/ui, ideal for responsive design needs.

### Icon Library
**Industry Standard: Lucide React**
- **Pros**: Comprehensive icon set, works perfectly with shadcn/ui, consistent design, tree-shakeable
- **Cons**: Limited customization options
- **Use Case**: Modern, clean iconography

**Popular Alternative: React Icons**
- **Pros**: Massive icon collection, multiple icon families, highly customizable
- **Cons**: Larger bundle size, inconsistent design across families
- **Use Case**: When you need specific icons from different families

**Recommendation**: **Lucide React** - Maintains consistency with shadcn/ui design system.

---

## State Management

### Global State
**Industry Standard: Zustand**
- **Pros**: Minimal boilerplate, TypeScript-first, excellent performance, small bundle size
- **Cons**: Less mature ecosystem, fewer dev tools
- **Use Case**: Modern React apps, simple state management

**Popular Alternative: Redux Toolkit**
- **Pros**: Mature ecosystem, excellent dev tools, predictable state updates, time-travel debugging
- **Cons**: More boilerplate, steeper learning curve, larger bundle size
- **Use Case**: Complex state management, when you need powerful debugging tools

**Recommendation**: **Redux Toolkit** - Mature ecosystem with excellent dev tools for managing complex state (user auth, feeds, messages, relay connections).

### Form State
**Industry Standard: React Hook Form**
- **Pros**: Excellent performance, minimal re-renders, great TypeScript support, works well with shadcn/ui
- **Cons**: Learning curve for complex forms
- **Use Case**: Forms with validation, performance-critical forms

**Popular Alternative: Formik**
- **Pros**: Mature, comprehensive form handling, extensive validation support
- **Cons**: More re-renders, larger bundle size, verbose API
- **Use Case**: Complex forms, when you need extensive validation

**Recommendation**: **React Hook Form** - Optimal performance for compose forms, profile editing, and settings.

---

## Routing & Navigation

### Client-Side Routing
**Industry Standard: React Router v6**
- **Pros**: Mature, comprehensive routing solution, excellent TypeScript support, nested routing
- **Cons**: Learning curve, can be complex for simple apps
- **Use Case**: Multi-page applications, complex routing needs

**Popular Alternative: Wouter**
- **Pros**: Lightweight, simple API, excellent performance, small bundle size
- **Cons**: Limited features, less mature ecosystem
- **Use Case**: Simple routing needs, when bundle size matters

**Recommendation**: **React Router v6** - Handles the complex routing needs (feeds, profiles, posts, messages, settings).

---

## Build Tools & Development

### Build Tool
**Industry Standard: Vite**
- **Pros**: Extremely fast HMR, excellent TypeScript support, modern ES modules, great plugin ecosystem
- **Cons**: Newer tool, some legacy compatibility issues
- **Use Case**: Modern development, TypeScript projects

**Popular Alternative: Webpack**
- **Pros**: Mature, comprehensive, extensive plugin ecosystem, battle-tested
- **Cons**: Slower development builds, complex configuration
- **Use Case**: Legacy projects, complex build requirements

**Recommendation**: **Vite** - Perfect for modern TypeScript React development.

### Package Manager
**Industry Standard: npm**
- **Pros**: Default Node.js package manager, universal compatibility, mature
- **Cons**: Slower installs, larger node_modules
- **Use Case**: Universal compatibility, simple projects

**Popular Alternative: pnpm**
- **Pros**: Faster installs, disk space efficient, strict dependency management
- **Cons**: Some compatibility issues, smaller ecosystem
- **Use Case**: Monorepos, when performance and disk space matter

**Recommendation**: **npm** - Universal compatibility and mature ecosystem, works reliably with all packages.

---

## Code Quality & Tooling

### Linting & Formatting
**Industry Standard: ESLint + Prettier**
- **Pros**: Mature ecosystem, extensive rules, separate concerns, highly configurable
- **Cons**: Two tools to configure, potential conflicts
- **Use Case**: Established projects, fine-grained control

**Popular Alternative: Biome**
- **Pros**: Single tool, extremely fast, zero configuration, consistent formatting
- **Cons**: Newer tool, less mature ecosystem, fewer rules
- **Use Case**: New projects, when you want simplicity and speed

**Recommendation**: **ESLint + Prettier** - More mature tooling for production applications.

### Testing Framework
**Decision**: **No testing framework for initial development** - Focus on rapid prototyping and core functionality first. Testing can be added later as the project matures.

---

## Real-time & WebSocket Management

### WebSocket Client
**Industry Standard: Native WebSocket**
- **Pros**: Built-in browser API, no dependencies, full control
- **Cons**: Manual connection management, no automatic reconnection
- **Use Case**: Simple WebSocket needs, when you want full control

**Popular Alternative: Socket.IO Client**
- **Pros**: Automatic reconnection, fallback transports, room management
- **Cons**: Requires Socket.IO server, larger bundle size, overkill for simple needs
- **Use Case**: Complex real-time applications, when you need fallback options

**Recommendation**: **Native WebSocket** - SNSTR library already handles WebSocket management for Nostr relays.

### Real-time State Synchronization
**Industry Standard: Custom solution with Zustand**
- **Pros**: Full control, minimal overhead, perfect integration with state management
- **Cons**: More development work, need to handle edge cases
- **Use Case**: Specific protocols like Nostr, custom requirements

**Popular Alternative: React Query/TanStack Query**
- **Pros**: Excellent caching, automatic background updates, optimistic updates
- **Cons**: HTTP-focused, may not fit Nostr's WebSocket-based protocol
- **Use Case**: REST API applications, when you need sophisticated caching

**Recommendation**: **Custom solution with Zustand** - Nostr's event-driven architecture requires custom real-time handling.

---

## Development & Deployment

### Local Development
**Industry Standard: Vite Dev Server**
- **Pros**: Extremely fast HMR, built-in TypeScript support, excellent debugging
- **Cons**: Different from production build
- **Use Case**: Modern development workflow

**Popular Alternative: Webpack Dev Server**
- **Pros**: Production-like environment, mature, extensive configuration
- **Cons**: Slower startup and HMR, more complex setup
- **Use Case**: When you need production parity

**Recommendation**: **Vite Dev Server** - Optimal development experience for this project.

### Deployment Platform
**Industry Standard: Vercel**
- **Pros**: Excellent Next.js/React support, automatic deployments, global CDN, preview deployments
- **Cons**: Vendor lock-in, pricing for high usage
- **Use Case**: React applications, when you want zero-config deployments

**Popular Alternative: Netlify**
- **Pros**: Generous free tier, excellent static site hosting, form handling, edge functions
- **Cons**: Less optimized for React specifically, some advanced features cost extra
- **Use Case**: Static sites, when you need built-in form handling

**Recommendation**: **Vercel** - Perfect for React applications, excellent developer experience.

---

## Performance & Optimization

### Bundle Analyzer
**Industry Standard: Rollup Bundle Analyzer (Vite)**
- **Pros**: Built into Vite, accurate bundle analysis, easy to use
- **Cons**: Limited to Vite projects
- **Use Case**: Vite projects, bundle optimization

**Popular Alternative: Webpack Bundle Analyzer**
- **Pros**: Comprehensive analysis, mature tool, extensive features
- **Cons**: Webpack-specific, more complex setup
- **Use Case**: Webpack projects, detailed bundle analysis

**Recommendation**: **Rollup Bundle Analyzer** - Built into Vite, perfect for this project.

### Performance Monitoring
**Industry Standard: Web Vitals + Lighthouse**
- **Pros**: Google's performance standards, built into browsers, comprehensive metrics
- **Cons**: Limited to performance metrics, no error tracking
- **Use Case**: Performance optimization, Core Web Vitals compliance

**Popular Alternative: Sentry Performance**
- **Pros**: Comprehensive monitoring, error tracking, user experience metrics
- **Cons**: Paid service, privacy considerations
- **Use Case**: Production applications, when you need comprehensive monitoring

**Recommendation**: **Web Vitals + Lighthouse** - Sufficient for most performance monitoring needs.

---

## Additional Considerations

### Environment Configuration
**Industry Standard: dotenv**
- **Pros**: Simple, widely adopted, framework agnostic
- **Cons**: Manual setup, no validation
- **Use Case**: Simple environment management

**Popular Alternative: Vite Environment Variables**
- **Pros**: Built-in, TypeScript support, secure by default
- **Cons**: Vite-specific
- **Use Case**: Vite projects, when you want built-in support

**Recommendation**: **Vite Environment Variables** - Built-in, secure, perfect for this project.

### Date/Time Handling
**Industry Standard: date-fns**
- **Pros**: Functional approach, tree-shakeable, excellent TypeScript support
- **Cons**: Larger API surface
- **Use Case**: Modern applications, when you need comprehensive date utilities

**Popular Alternative: Day.js**
- **Pros**: Moment.js API compatibility, smaller bundle size, immutable
- **Cons**: Fewer features than date-fns
- **Use Case**: When you need Moment.js compatibility with smaller size

**Recommendation**: **date-fns** - Better TypeScript support, more comprehensive for social media timestamps.

---

## Recommended Final Stack

Based on the project requirements and considerations:

### Core Technologies
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Icons**: Lucide React
- **Nostr Library**: snstr (local)

### State & Data Management
- **State Management**: Redux Toolkit
- **Form Handling**: React Hook Form
- **Routing**: React Router v6

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier

### Deployment & Performance
- **Deployment**: Vercel
- **Bundle Analysis**: Rollup Bundle Analyzer
- **Performance**: Web Vitals + Lighthouse

### Utilities
- **Date/Time**: date-fns
- **Environment**: Vite Environment Variables

This stack provides excellent developer experience, optimal performance, and aligns perfectly with your project's requirements for a modern, responsive Twitter-like Nostr client.

---

## Best Practices, Limitations, and Conventions

### Core Technologies

#### React 18 + TypeScript

**Best Practices:**
- Use functional components with hooks exclusively
- Implement proper TypeScript interfaces for all props and state
- Use `React.FC<Props>` sparingly - prefer explicit function declarations
- Always use `useCallback` for event handlers passed to child components
- Use `useMemo` for expensive calculations, not for simple object/array creation
- Implement proper error boundaries for graceful error handling
- Use `React.lazy()` and `Suspense` for code splitting
- Keep components under 150 lines - split larger components into smaller ones

**Limitations:**
- TypeScript compilation adds build time overhead
- Strict mode may cause double renders in development
- Hook rules must be followed strictly (no conditional hooks)
- PropTypes are redundant with TypeScript but some libraries still require them

**Conventions:**
- Use PascalCase for component names and filenames
- Use camelCase for props and state variables
- Prefix custom hooks with `use` (e.g., `useNostrAuth`)
- Export components as default, utilities as named exports
- Place interfaces and types in the same file as the component or in a separate `types.ts`

**Common Pitfalls:**
- Forgetting to include dependencies in `useEffect` arrays
- Creating objects/arrays inline in JSX causing unnecessary re-renders
- Not memoizing expensive computations
- Using `any` type instead of proper typing
- Mutating state directly instead of using setter functions

#### Vite

**Best Practices:**
- Use environment variables with `VITE_` prefix for client-side access
- Implement proper path aliases in `vite.config.ts` for cleaner imports
- Use `import.meta.env` instead of `process.env` for environment variables
- Enable gzip compression for production builds
- Configure proper asset optimization for images and fonts
- Use `vite-plugin-pwa` for progressive web app features

**Limitations:**
- Some Node.js polyfills may be needed for certain libraries
- Hot module replacement may not work perfectly with all libraries
- Build output differs from webpack - may require deployment adjustments
- Limited server-side rendering support compared to Next.js

**Conventions:**
- Keep `vite.config.ts` clean and well-organized
- Use relative imports for local files, absolute for external packages
- Configure path aliases: `@/` for src, `@/components` for components
- Use `.env.local` for local development variables
- Separate development and production configurations

**Common Pitfalls:**
- Forgetting `VITE_` prefix on environment variables
- Not configuring proper base path for subdirectory deployments
- Using Node.js APIs in client code without polyfills
- Not optimizing bundle size for production

#### shadcn/ui + Tailwind CSS

**Best Practices:**
- Use the shadcn/ui CLI to add components (`npx shadcn-ui@latest add button`)
- Customize theme colors in `tailwind.config.js` before building components
- Use CSS variables for consistent theming across components
- Implement dark mode support from the start
- Use Tailwind's responsive prefixes consistently (`sm:`, `md:`, `lg:`, `xl:`)
- Compose utility classes into semantic component variants
- Use `clsx` or `cn` utility for conditional class names

**Limitations:**
- Bundle size can grow large with unused utilities (requires purging)
- Learning curve for utility-first CSS approach
- Customizing shadcn/ui components requires understanding the underlying Radix UI APIs
- Some advanced CSS features require custom CSS classes

**Conventions:**
- Use semantic color names in theme configuration
- Follow mobile-first responsive design principles
- Place custom styles in `globals.css` or component-specific CSS modules
- Use consistent spacing scale (4, 8, 12, 16, 24, 32, 48, 64)
- Prefix custom utility classes with project name

**Common Pitfalls:**
- Not setting up proper purging for production builds
- Overriding shadcn/ui component styles incorrectly
- Using arbitrary values instead of design system tokens
- Not maintaining consistent spacing and sizing scale
- Forgetting to configure dark mode variants

#### Lucide React

**Best Practices:**
- Import icons individually to reduce bundle size: `import { Home } from 'lucide-react'`
- Use consistent icon sizing throughout the application
- Implement proper accessibility with `aria-label` or `aria-hidden`
- Create icon wrapper components for consistent styling
- Use appropriate icon sizes for different contexts (16px, 20px, 24px)
- Implement icon loading states for dynamic icons

**Limitations:**
- Limited icon set compared to icon libraries like React Icons
- Some icons may not be available, requiring custom SVGs
- Bundle size increases with each imported icon
- No icon animation support built-in

**Conventions:**
- Use size prop consistently: `<Icon size={20} />`
- Apply colors using Tailwind classes or CSS variables
- Create icon components for commonly used icons with preset styles
- Use semantic naming for icon components

**Common Pitfalls:**
- Importing entire icon library instead of individual icons
- Not providing proper accessibility attributes
- Using inconsistent icon sizes across the application
- Not optimizing icon bundle size

#### snstr (Local Nostr Library)

**Best Practices:**
- Always handle connection failures gracefully
- Implement proper event validation before processing
- Use connection pooling for multiple relays
- Cache events locally to reduce relay queries
- Implement proper cleanup for WebSocket connections
- Handle relay reconnection automatically
- Use proper error boundaries for Nostr-related errors

**Limitations:**
- Library is in development and may have breaking changes
- Documentation may be incomplete
- Some NIPs may not be fully implemented
- WebSocket connection limits may affect performance

**Conventions:**
- Wrap SNSTR library calls in try-catch blocks
- Use TypeScript interfaces for all Nostr events and responses
- Implement proper logging for debugging relay connections
- Create utility functions for common Nostr operations
- Use consistent error handling patterns across the application

**Common Pitfalls:**
- Not handling WebSocket connection errors properly
- Forgetting to clean up subscriptions and connections
- Not validating event signatures before processing
- Assuming all relays support all NIPs
- Not implementing proper rate limiting for relay requests

### State & Data Management

#### Redux Toolkit

**Best Practices:**
- Use `createSlice` for all state management
- Implement proper TypeScript typing for state and actions
- Use `createAsyncThunk` for async operations
- Structure state by feature, not by data type
- Use `createSelector` for computed state values
- Implement proper error handling in async thunks
- Use `extraReducers` for handling async thunk states
- Keep actions simple and focused on a single responsibility

**Limitations:**
- Learning curve for Redux concepts
- Boilerplate code even with Redux Toolkit
- DevTools extension required for optimal debugging
- Can be overkill for simple state management needs

**Conventions:**
- Name slices after the feature they manage
- Use present tense for action names (`setUser`, `addPost`)
- Keep reducers pure and side-effect free
- Structure store with clear feature boundaries
- Use consistent naming patterns for async actions

**Common Pitfalls:**
- Mutating state directly in reducers (even though RTK uses Immer)
- Not properly typing state and actions
- Creating overly complex state structures
- Not handling loading and error states in async thunks
- Dispatching actions in reducers (use middleware instead)

#### React Hook Form

**Best Practices:**
- Use `useForm` hook with proper TypeScript interfaces
- Implement form validation with `zod` or `yup`
- Use `Controller` component for complex form fields
- Implement proper error handling and display
- Use `formState.isValid` for form submission enabling
- Implement proper form reset functionality
- Use `watch` for dependent form fields

**Limitations:**
- Learning curve for advanced form patterns
- Complex validation logic can become unwieldy
- Some third-party components may not integrate perfectly
- Re-renders can still occur with incorrect usage

**Conventions:**
- Define form interfaces with TypeScript
- Use consistent error message formatting
- Implement proper form submission states
- Use semantic HTML form elements
- Create reusable form components

**Common Pitfalls:**
- Not properly registering form fields
- Causing unnecessary re-renders with incorrect `watch` usage
- Not handling form submission errors properly
- Forgetting to reset forms after successful submission
- Not implementing proper form validation feedback

#### React Router v6

**Best Practices:**
- Use nested routing for better code organization
- Implement proper route guards for authentication
- Use `useNavigate` instead of `useHistory`
- Implement proper error boundaries for route errors
- Use `Outlet` component for nested route rendering
- Implement proper loading states during route transitions
- Use route parameters with proper TypeScript typing

**Limitations:**
- Breaking changes from v5 require migration
- Some advanced routing patterns are complex
- Bundle size increases with complex routing
- SSR support requires additional setup

**Conventions:**
- Use kebab-case for route paths
- Implement consistent route structure
- Use route parameters for dynamic content
- Create route constants for type safety
- Implement proper route-based code splitting

**Common Pitfalls:**
- Not properly handling route parameters
- Forgetting to implement proper route guards
- Not handling navigation errors gracefully
- Using incorrect hook versions (v6 vs v5)
- Not implementing proper route-based state management

### Development Tools

#### npm

**Best Practices:**
- Use `package-lock.json` for consistent dependency versions
- Regularly update dependencies with `npm audit`
- Use `npm ci` in production/CI environments
- Implement proper `.npmrc` configuration
- Use semantic versioning for project versions
- Keep `package.json` clean and well-organized
- Use `npm scripts` for common development tasks

**Limitations:**
- Slower install times compared to yarn/pnpm
- Larger `node_modules` size
- Some dependency resolution issues
- Limited workspace support

**Conventions:**
- Use exact versions for critical dependencies
- Group dependencies logically in `package.json`
- Use meaningful script names in `package.json`
- Document custom scripts in README
- Use proper semantic versioning

**Common Pitfalls:**
- Not committing `package-lock.json`
- Using `npm install` instead of `npm ci` in CI
- Not regularly updating dependencies
- Installing global packages instead of using npx
- Not properly configuring registry settings

#### ESLint + Prettier

**Best Practices:**
- Use `@typescript-eslint/recommended` configuration
- Configure Prettier to work with ESLint
- Use `eslint-config-prettier` to avoid conflicts
- Implement proper VS Code integration
- Use consistent formatting rules across the team
- Configure proper import sorting
- Implement proper TypeScript-specific linting rules

**Limitations:**
- Configuration complexity can grow over time
- Potential conflicts between ESLint and Prettier
- Some rules may conflict with TypeScript patterns
- Performance impact on large codebases

**Conventions:**
- Use `.eslintrc.js` for configuration
- Configure consistent indentation and spacing
- Use proper import order rules
- Implement consistent naming conventions
- Configure proper React-specific rules

**Common Pitfalls:**
- Not configuring proper TypeScript ESLint rules
- Conflicts between ESLint and Prettier configurations
- Not implementing proper import sorting
- Overriding too many rules making linting ineffective
- Not integrating with VS Code properly

### Deployment & Performance

#### Vercel

**Best Practices:**
- Use environment variables for sensitive configuration
- Implement proper build optimization settings
- Configure proper domain and SSL settings
- Use preview deployments for testing
- Implement proper monitoring and analytics
- Configure proper caching headers
- Use Vercel's Edge Functions for API endpoints if needed

**Limitations:**
- Vendor lock-in with Vercel platform
- Function execution time limits
- Storage limitations for large assets
- Pricing can increase with high usage

**Conventions:**
- Use proper environment variable naming
- Configure proper build commands
- Use consistent deployment settings
- Implement proper branch-based deployments
- Document deployment procedures

**Common Pitfalls:**
- Not configuring proper build settings
- Exposing sensitive information in environment variables
- Not implementing proper caching strategies
- Not monitoring deployment performance
- Not configuring proper custom domains

#### Bundle Analysis & Performance Monitoring

**Best Practices:**
- Regularly analyze bundle size with Rollup Bundle Analyzer
- Implement proper code splitting strategies
- Monitor Core Web Vitals with Lighthouse
- Use performance budgets to prevent regressions
- Implement proper lazy loading for images and components
- Monitor real user performance metrics
- Optimize critical rendering path

**Limitations:**
- Analysis tools may not catch all performance issues
- Real-world performance may differ from lab conditions
- Some optimizations may require significant refactoring
- Performance monitoring can add overhead

**Conventions:**
- Set up regular performance monitoring
- Document performance budgets and goals
- Implement proper performance testing procedures
- Use consistent performance measurement tools
- Create performance dashboards for monitoring

**Common Pitfalls:**
- Not regularly monitoring bundle size
- Ignoring performance regressions
- Not implementing proper lazy loading
- Focusing only on initial load performance
- Not testing performance on different devices and networks

### Utilities

#### date-fns

**Best Practices:**
- Import only specific functions needed: `import { format } from 'date-fns'`
- Use consistent date formatting throughout the application
- Implement proper timezone handling
- Use relative date formatting for social media timestamps
- Implement proper date validation
- Use date-fns with proper TypeScript typing

**Limitations:**
- Larger bundle size if not properly tree-shaken
- Timezone handling requires additional configuration
- Some locale support may be limited
- Immutable approach may require learning curve

**Conventions:**
- Use consistent date formats across the application
- Implement proper locale support
- Use semantic function names for date operations
- Create utility functions for common date operations

**Common Pitfalls:**
- Importing entire library instead of specific functions
- Not handling timezone differences properly
- Using inconsistent date formatting
- Not validating date inputs properly
- Mutating date objects instead of creating new ones

#### Vite Environment Variables

**Best Practices:**
- Use `VITE_` prefix for client-side environment variables
- Keep sensitive data in server-side environment variables only
- Use proper TypeScript typing for environment variables
- Implement proper fallback values for missing variables
- Document all environment variables in README
- Use different `.env` files for different environments

**Limitations:**
- Client-side variables are exposed in bundle
- Limited to string values only
- Must restart development server for changes
- No runtime environment variable changes

**Conventions:**
- Use descriptive variable names
- Group related variables together
- Use consistent naming patterns
- Implement proper validation for required variables
- Document variable purposes and expected values

**Common Pitfalls:**
- Exposing sensitive data in client-side variables
- Forgetting `VITE_` prefix for client-side variables
- Not implementing proper fallback values
- Hardcoding environment-specific values
- Not documenting environment variable requirements

---

## Project-Specific Considerations

### Nostr Integration Patterns

- Always validate events before processing them
- Implement proper relay connection pooling
- Handle WebSocket connection errors gracefully
- Cache events locally to reduce relay load
- Implement proper subscription cleanup
- Handle relay-specific feature differences
- Use proper error boundaries for Nostr operations

### Real-time State Management

- Use Redux Toolkit's `createAsyncThunk` for relay operations
- Implement proper loading states for real-time updates
- Handle optimistic updates for better UX
- Use proper event deduplication across relays
- Implement proper event ordering and threading
- Handle relay disconnect/reconnect scenarios

### Mobile-First Design Considerations

- Implement proper touch interactions
- Use appropriate component sizes for mobile
- Implement proper responsive navigation
- Optimize performance for mobile devices
- Test on various screen sizes and orientations
- Implement proper mobile-specific UX patterns

This comprehensive guide should serve as a reference throughout development, helping avoid common pitfalls and ensuring best practices are followed consistently across the project. 