# Setup Phase - Foundation & Framework

**Duration**: Weeks 1-2  
**Objective**: Establish a working development environment and basic application framework that can run but isn't fully functional yet.

---

## Phase Overview

This phase focuses on setting up the foundational architecture, tooling, and basic structure needed for development. At the end of this phase, you'll have a running application with basic navigation and authentication detection, but core features won't be implemented yet.

**Success Criteria:**
- ✅ Development environment is fully configured
- ✅ Application runs in development mode
- ✅ Basic routing and navigation work
- ✅ NIP-07 extension detection works
- ✅ Project structure follows established conventions
- ✅ Basic UI components are available

---

## Feature 1: Project Setup & Tooling

**Goal**: Configure the development environment and build tools

### Tasks:
1. **Initialize Vite + React + TypeScript project**
   - Run `npm create vite@latest . -- --template react-ts`
   - Update `package.json` with project details and scripts
   - Configure `vite.config.ts` with path aliases (@/* mappings)

2. **Install and configure core dependencies**
   - Install Redux Toolkit, React Router, React Hook Form
   - Install shadcn/ui, Tailwind CSS, Lucide React
   - Install date-fns and development dependencies (ESLint, Prettier)

3. **Set up development tooling**
   - Configure ESLint with TypeScript and React rules
   - Set up Prettier with consistent formatting rules
   - Create `.gitignore` with appropriate patterns

4. **Configure TypeScript**
   - Update `tsconfig.json` with strict settings and path mappings
   - Create `src/types/index.ts` for global type definitions
   - Set up proper module resolution

5. **Create basic project structure**
   - Set up directory structure per project-rules.md
   - Create index files for clean imports
   - Add initial README with setup instructions

---

## Feature 2: Theme & Styling Foundation

**Goal**: Implement the dark cypherpunk theme system

### Tasks:
1. **Configure Tailwind CSS**
   - Install and configure Tailwind with custom theme colors
   - Add CSS variables for the cypherpunk color system
   - Configure component class utilities

2. **Create global styles**
   - Set up `src/styles/globals.css` with CSS variables
   - Implement base typography and layout styles
   - Add dark theme as default with proper background colors

3. **Set up shadcn/ui components**
   - Initialize shadcn/ui with `npx shadcn-ui@latest init`
   - Customize theme configuration for cypherpunk aesthetics
   - Install basic components (Button, Input, Card)

4. **Create theme utilities**
   - Build `src/utils/cn.ts` for conditional class names
   - Create theme constants and color mappings
   - Set up responsive design utilities

5. **Test theme implementation**
   - Create sample components to verify theme
   - Ensure proper dark mode functionality
   - Validate color contrast for accessibility

---

## Feature 3: Basic Application Structure

**Goal**: Set up the core application shell and routing

### Tasks:
1. **Create application layout components**
   - Build `src/components/layout/PageLayout.tsx` with basic structure
   - Create `src/components/layout/Header.tsx` with app branding
   - Build responsive navigation shell (desktop sidebar, mobile bottom tabs)

2. **Set up React Router**
   - Configure router with main application routes
   - Create route constants for type safety
   - Set up lazy loading for page components

3. **Create placeholder page components**
   - Build `src/pages/Timeline/TimelinePage.tsx` (empty shell)
   - Create `src/pages/Profile/ProfilePage.tsx` (basic structure)
   - Add `src/pages/Settings/SettingsPage.tsx` placeholder

4. **Implement basic navigation**
   - Create navigation menu with proper links
   - Add active state handling for current route
   - Ensure navigation works on both mobile and desktop

5. **Add error boundary**
   - Create `src/components/common/ErrorBoundary.tsx`
   - Wrap main application with error handling
   - Add fallback UI for graceful error display

---

## Feature 4: Authentication Detection

**Goal**: Detect and handle NIP-07 browser extension presence

### Tasks:
1. **Create authentication types**
   - Define `src/types/auth.ts` with authentication interfaces
   - Create user and authentication state types
   - Set up error types for authentication failures

2. **Build NIP-07 detection utility**
   - Create `src/utils/nip07.ts` for extension detection
   - Implement `checkNIP07Extension()` function
   - Add extension capability checking

3. **Create authentication context**
   - Build `src/features/auth/AuthContext.tsx` with React Context
   - Implement authentication state management
   - Add login/logout placeholder functions

4. **Add extension detection UI**
   - Create components to show extension status
   - Build installation guidance for missing extensions
   - Add loading states for extension checks

5. **Integrate authentication in app**
   - Wrap app with authentication provider
   - Show appropriate UI based on extension presence
   - Add basic login/logout buttons (non-functional yet)

---

## Feature 5: Redux Store Setup

**Goal**: Configure Redux Toolkit store for state management

### Tasks:
1. **Create store configuration**
   - Set up `src/store/index.ts` with store configuration
   - Configure Redux DevTools for development
   - Add basic middleware setup

2. **Create initial slices**
   - Build `src/store/slices/authSlice.ts` with basic auth state
   - Create `src/store/slices/uiSlice.ts` for UI state
   - Add proper TypeScript types for all slices

3. **Set up selectors**
   - Create `src/store/selectors/authSelectors.ts`
   - Add memoized selectors using createSelector
   - Ensure proper TypeScript integration

4. **Integrate store with app**
   - Wrap application with Redux Provider
   - Connect authentication context to Redux
   - Test store integration with basic state updates

5. **Add development debugging**
   - Configure Redux DevTools properly
   - Add action logging for development
   - Set up time-travel debugging capabilities

---

## Feature 6: Basic UI Components

**Goal**: Create essential reusable components following design system

### Tasks:
1. **Create base UI components**
   - Build `src/components/ui/Avatar.tsx` with placeholder functionality
   - Create `src/components/ui/LoadingSpinner.tsx`
   - Add `src/components/ui/Modal.tsx` for overlays

2. **Build common components**
   - Create `src/components/common/Logo.tsx` with app branding
   - Build `src/components/common/StatusIndicator.tsx` for connection status
   - Add `src/components/common/EmptyState.tsx` for empty data

3. **Create layout components**
   - Build `src/components/layout/Sidebar.tsx` for desktop navigation
   - Create `src/components/layout/MobileNavigation.tsx` for mobile tabs
   - Add `src/components/layout/Container.tsx` for consistent spacing

4. **Add interaction components**
   - Create basic button variations following theme
   - Build input components with proper styling
   - Add form components with validation states

5. **Test component library**
   - Create simple component showcase page
   - Verify all components follow design system
   - Ensure proper TypeScript props and exports

---

## Phase Deliverables

At the end of the Setup Phase, you will have:

### **Technical Infrastructure**
- ✅ Fully configured Vite + React + TypeScript development environment
- ✅ Complete tooling setup (ESLint, Prettier, path aliases)
- ✅ Redux Toolkit store with basic slices
- ✅ React Router with lazy loading
- ✅ shadcn/ui integrated with custom cypherpunk theme

### **Application Structure**
- ✅ Complete directory structure following project rules
- ✅ Basic page components and routing
- ✅ Responsive navigation shell (desktop + mobile)
- ✅ Error boundary and error handling
- ✅ Authentication context with NIP-07 detection

### **UI Foundation**
- ✅ Dark cypherpunk theme fully implemented
- ✅ Core reusable components (Avatar, Button, Input, Modal)
- ✅ Layout components (Sidebar, Header, Container)
- ✅ Proper TypeScript types throughout

### **Development Experience**
- ✅ Hot module replacement working
- ✅ Redux DevTools configured
- ✅ Linting and formatting rules enforced
- ✅ Clear documentation and setup instructions

---

## Testing & Validation

### Manual Testing Checklist
- [ ] `npm run dev` starts application successfully
- [ ] Navigation between pages works
- [ ] Mobile and desktop layouts render correctly
- [ ] Browser extension detection works (with and without extension)
- [ ] Redux DevTools show state changes
- [ ] All components render without errors
- [ ] Theme colors display correctly
- [ ] TypeScript compilation has no errors

### Ready for Next Phase When:
- [ ] All components follow established design system
- [ ] Authentication detection is reliable
- [ ] Navigation is fully functional
- [ ] Development workflow is smooth and efficient
- [ ] Code follows all project rules and conventions

---

## Notes & Considerations

**Key Dependencies**: Ensure all package versions are compatible and up-to-date
**Performance**: Keep initial bundle size small, set up code splitting early
**Accessibility**: Verify keyboard navigation and screen reader compatibility
**Documentation**: Keep README updated with setup and development instructions

This setup phase creates the foundation for rapid feature development in subsequent phases while ensuring code quality and maintainability from the start. 