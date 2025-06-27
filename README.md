# snstr-client-test

A modern, Twitter-like social media client built on the Nostr protocol. This project bridges traditional social media experiences with decentralized, censorship-resistant communication through an intuitive, familiar interface.

## 🎯 Project Overview

**snstr-client-test** is a web application that provides users with a Twitter-like social media experience while leveraging the power of the Nostr protocol. Built with modern web technologies and designed for mainstream adoption, it makes decentralized social networking accessible to users migrating from traditional platforms.

### Key Features

- **🔐 Secure Authentication**: NIP-07 browser extension integration (Alby, nos2x, Flamingo)
- **📱 Responsive Design**: Mobile-first approach with desktop optimization
- **⚡ Lightning Zaps**: Bitcoin micropayments via NIP-57 integration
- **💬 Direct Messages**: End-to-end encrypted messaging (NIP-04/NIP-44)
- **🔄 Real-time Updates**: Live timeline feeds with WebSocket connections
- **🎨 Dark Theme**: Cypherpunk minimalism with content-first design
- **📡 Relay Management**: Multi-relay support with connection monitoring
- **🔍 Search & Discovery**: Find users, content, and trending topics

### Target Audience

- **Primary**: Twitter migrants seeking privacy and censorship resistance
- **Secondary**: Existing Nostr users wanting better UX
- **Tertiary**: Developers learning Nostr client development

## 🛠️ Tech Stack

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
- **Type Checking**: TypeScript strict mode

### Deployment & Performance
- **Deployment**: Vercel
- **Bundle Analysis**: Rollup Bundle Analyzer
- **Performance**: Web Vitals + Lighthouse

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- NIP-07 compatible browser extension (Alby, nos2x, or Flamingo)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd snstr-client-test

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
VITE_DEFAULT_RELAYS=wss://relay.primal.net,wss://relay.damus.io,wss://relay.snort.social
VITE_APP_NAME=snstr-client-test
```

## 📁 Project Structure

```
snstr-client-test/
├── docs/                    # Project documentation
│   ├── phases/             # Development phase documents
│   ├── project-overview.md # Project goals and scope
│   ├── user-flow.md        # User journey mapping
│   ├── tech-stack.md       # Technology decisions
│   ├── project-rules.md    # Development standards
│   ├── ui-rules.md         # Design guidelines
│   └── theme-rules.md      # Visual theme specification
├── public/                 # Static assets
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page-level components
│   ├── features/          # Feature-specific modules
│   ├── store/             # Redux store configuration
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Global styles and theme
└── tests/                 # Test files
```

## 🎨 Design Philosophy

### Cypherpunk Minimalism
- **Content-First**: Clean, distraction-free interface
- **Technical Transparency**: Clear indication of decentralized features
- **Dark Theme**: Pure black backgrounds with cyan accents
- **Accessibility**: WCAG AA compliance with inclusive design

### Design System
- **Colors**: CSS variables for consistent theming
- **Typography**: Inter + JetBrains Mono for modern, technical feel
- **Spacing**: 4px grid system for consistent layout
- **Icons**: Lucide React for unified iconography

## 🏗️ Development Standards

### AI-First Codebase Principles

- **File Size Limit**: Maximum 500 lines per file for AI compatibility
- **Modular Architecture**: Self-contained components with clear interfaces
- **Comprehensive Documentation**: JSDoc comments for all functions
- **Type Safety**: Full TypeScript coverage with strict mode

### Code Organization

```typescript
/**
 * @fileoverview Brief description of file purpose
 * Component/utility description and usage examples
 */

// 1. External library imports
import React from 'react';

// 2. Internal feature imports  
import { useNostrAuth } from '@/features/auth';

// 3. Component imports
import { Button } from '@/components/ui';

// 4. Types and utilities
import type { User } from '@/types';
```

### Naming Conventions

- **PascalCase**: React components, TypeScript interfaces
- **camelCase**: Functions, variables, hooks
- **kebab-case**: File names, CSS classes
- **UPPER_SNAKE_CASE**: Constants, environment variables

## 🧪 Testing & Quality

### Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Feature-level testing
- **E2E Tests**: Playwright (future implementation)
- **Type Safety**: TypeScript strict mode

### Quality Standards
- **Test Coverage**: >90% for critical paths
- **Performance**: <2s page load, <3s time to interactive
- **Accessibility**: WCAG AA compliance
- **Bundle Size**: <300KB initial load

## 🚀 Development Phases

The project follows a structured 4-phase development approach:

1. **Setup Phase** (Weeks 1-2): Foundation and basic functionality
2. **MVP Phase** (Weeks 3-5): Core social media features
3. **Enhanced Phase** (Weeks 6-8): Advanced features and optimization
4. **Production Phase** (Weeks 9-10): Polish, testing, and launch

See the [development phases documentation](./docs/phases/) for detailed roadmaps.

## 🤝 Contributing

### Development Workflow

1. **Follow Project Rules**: Adhere to coding standards in `docs/project-rules.md`
2. **Documentation First**: Update relevant docs for new features
3. **Type Safety**: Maintain full TypeScript coverage
4. **Testing**: Include tests for new functionality
5. **Performance**: Consider impact on bundle size and runtime performance

### Git Conventions

```bash
feat: add new post composer component
fix: resolve relay connection timeout issue
docs: update authentication flow documentation
style: apply consistent button styling
refactor: extract post utilities to separate module
```

### Code Review Checklist

- [ ] File adheres to 500-line limit
- [ ] All functions have JSDoc comments
- [ ] TypeScript interfaces properly defined
- [ ] Components properly memoized
- [ ] Error handling implemented
- [ ] Performance considerations addressed

## 📖 Documentation

- **[Project Overview](./docs/project-overview.md)**: Goals, scope, and target audience
- **[User Flow](./docs/user-flow.md)**: Complete user journey mapping
- **[Tech Stack](./docs/tech-stack.md)**: Technology decisions and best practices
- **[Project Rules](./docs/project-rules.md)**: Development standards and conventions
- **[UI Rules](./docs/ui-rules.md)**: Design principles and guidelines
- **[Theme Rules](./docs/theme-rules.md)**: Visual theme specification

## 🔗 Key Resources

- **Nostr Protocol**: [nostr.com](https://nostr.com)
- **NIP Specifications**: [github.com/nostr-protocol/nips](https://github.com/nostr-protocol/nips)
- **Browser Extensions**: [Alby](https://getalby.com), [nos2x](https://github.com/fiatjaf/nos2x), [Flamingo](https://flamingo.me)
- **Default Relays**: relay.primal.net, relay.damus.io, relay.snort.social

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Building the future of decentralized social media, one commit at a time.** 🚀
