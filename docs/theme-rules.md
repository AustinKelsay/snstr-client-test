# snstr-client-test - Theme Rules & Visual System

This document defines the complete visual theme system for the snstr-client-test application, establishing consistent colors, typography, spacing, and visual effects that create a cohesive dark cypherpunk aesthetic.

---

## Theme Philosophy

### Visual Identity
**Dark Cypherpunk Minimalism**: A sophisticated dark theme that honors the technical, privacy-focused nature of the Nostr protocol while remaining accessible to mainstream users. The theme balances stark minimalism with subtle technological accents.

**Technical Aesthetic**: Visual elements should feel precise, clean, and purposeful—like a well-designed terminal interface or cybersecurity tool. Every color choice should reinforce the themes of privacy, decentralization, and technical excellence.

**Hierarchy Through Contrast**: In a predominantly dark interface, hierarchy is established through strategic use of bright accents, varying levels of opacity, and purposeful color application.

---

## Color System

### Primary Palette

#### **Background Colors**
```css
/* Core Backgrounds */
--bg-primary: #000000;        /* Pure black - main app background */
--bg-secondary: #0a0a0a;      /* Dark cards, modals, elevated surfaces */
--bg-tertiary: #1a1a1a;       /* Input fields, hover states, inactive tabs */
--bg-quaternary: #2a2a2a;     /* Borders, dividers, subtle separations */

/* Interactive Backgrounds */
--bg-hover: #0d1117;          /* Subtle hover state for clickable areas */
--bg-active: #161b22;         /* Active/pressed state backgrounds */
--bg-selected: #1f2937;       /* Selected items, active navigation */
```

#### **Text Colors**
```css
/* Text Hierarchy */
--text-primary: #ffffff;      /* Primary content, usernames, headlines */
--text-secondary: #a0a0a0;    /* Secondary info, timestamps, metadata */
--text-tertiary: #666666;     /* Muted text, placeholders, disabled states */
--text-quaternary: #404040;   /* Very subtle text, fine print */

/* Interactive Text */
--text-link: #00ff41;         /* Links, clickable text elements */
--text-link-hover: #33ff66;   /* Hovered link states */
--text-inverse: #000000;      /* Text on light backgrounds (rare) */
```

#### **Accent Colors**
```css
/* Primary Accents - Matrix Green Theme */
--accent-primary: #00ff41;    /* Primary interactive elements, focus states */
--accent-secondary: #00cc33;  /* Secondary actions, less prominent interactions */
--accent-tertiary: #009922;   /* Subtle accents, background highlights */

/* Semantic Colors */
--success: #00ff00;           /* Success states, connected relays, confirmations */
--warning: #ffaa00;           /* Warnings, caution states, pending actions */
--error: #ff3366;             /* Errors, disconnections, failed actions */
--info: #4da6ff;              /* Information, neutral notifications */

/* Special Purpose */
--bitcoin: #f7931a;           /* Bitcoin/Lightning related elements */
--nostr: #8b5cf6;             /* Nostr protocol specific elements */
--verification: #00ff00;      /* NIP-05 verification badges */
```

### Border & Surface System

#### **Borders**
```css
/* Border Colors */
--border-primary: #2a2a2a;    /* Main borders, card outlines */
--border-secondary: #404040;  /* Subtle dividers, section separations */
--border-accent: #00ff41;     /* Focus rings, active states */
--border-error: #ff3366;      /* Error borders, validation failures */
--border-success: #00ff00;    /* Success borders, confirmations */

/* Border Widths */
--border-thin: 1px;           /* Standard borders */
--border-thick: 2px;          /* Emphasis borders, focus rings */
--border-heavy: 3px;          /* Strong emphasis, alerts */
```

#### **Shadows & Elevation**
```css
/* Shadow System */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);           /* Subtle elevation */
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);           /* Card elevation */
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);         /* Modal elevation */
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);         /* Maximum elevation */

/* Glow Effects */
--glow-green: 0 0 10px rgba(0, 255, 65, 0.3);        /* Matrix green accent glow */
--glow-success: 0 0 10px rgba(0, 255, 0, 0.3);       /* Success glow */
--glow-orange: 0 0 10px rgba(255, 170, 0, 0.3);      /* Warning glow */
--glow-red: 0 0 10px rgba(255, 51, 102, 0.3);        /* Error glow */
```

---

## Typography System

### Font Families
```css
/* Primary Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, 'Liberation Mono', monospace;

/* Font Weights */
--font-thin: 100;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;
```

### Typography Scale
```css
/* Font Sizes */
--text-xs: 0.75rem;      /* 12px - Fine print, technical metadata */
--text-sm: 0.875rem;     /* 14px - Secondary information, timestamps */
--text-base: 1rem;       /* 16px - Body text, post content */
--text-lg: 1.125rem;     /* 18px - Emphasized text, usernames */
--text-xl: 1.25rem;      /* 20px - Subheadings, section titles */
--text-2xl: 1.5rem;      /* 24px - Page headings, major sections */
--text-3xl: 1.875rem;    /* 30px - Hero text, main titles */
--text-4xl: 2.25rem;     /* 36px - Large display text */

/* Line Heights */
--leading-tight: 1.25;   /* Headings, compact text */
--leading-normal: 1.5;   /* Body text, readable content */
--leading-relaxed: 1.625;/* Comfortable reading for long content */
--leading-loose: 2;      /* Very spacious, special emphasis */
```

### Text Styles
```css
/* Semantic Text Styles */
.text-username {
  font-family: var(--font-sans);
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.text-timestamp {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  color: var(--text-secondary);
}

.text-technical {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  color: var(--text-tertiary);
  letter-spacing: 0.025em;
}

.text-emphasis {
  font-family: var(--font-sans);
  font-weight: var(--font-semibold);
  color: var(--accent-primary);
}
```

---

## Spacing & Layout System

### Spacing Scale
```css
/* Spacing Tokens */
--space-0: 0;           /* No spacing */
--space-1: 0.25rem;     /* 4px - Fine adjustments */
--space-2: 0.5rem;      /* 8px - Small gaps */
--space-3: 0.75rem;     /* 12px - Medium-small gaps */
--space-4: 1rem;        /* 16px - Standard spacing unit */
--space-5: 1.25rem;     /* 20px - Medium spacing */
--space-6: 1.5rem;      /* 24px - Large spacing */
--space-8: 2rem;        /* 32px - Section spacing */
--space-10: 2.5rem;     /* 40px - Large section spacing */
--space-12: 3rem;       /* 48px - Page margins */
--space-16: 4rem;       /* 64px - Major layout spacing */
--space-20: 5rem;       /* 80px - Extra large spacing */
--space-24: 6rem;       /* 96px - Maximum spacing */
```

### Component Sizing
```css
/* Interactive Elements */
--size-button-sm: 32px;    /* Small buttons, compact actions */
--size-button-md: 40px;    /* Standard buttons */
--size-button-lg: 48px;    /* Large buttons, primary actions */

/* Form Elements */
--size-input-sm: 36px;     /* Compact form inputs */
--size-input-md: 44px;     /* Standard form inputs (touch-friendly) */
--size-input-lg: 52px;     /* Large form inputs */

/* Avatars */
--size-avatar-xs: 24px;    /* Tiny avatars, inline mentions */
--size-avatar-sm: 32px;    /* Small avatars, timeline */
--size-avatar-md: 48px;    /* Medium avatars, profiles */
--size-avatar-lg: 64px;    /* Large avatars, profile headers */
--size-avatar-xl: 96px;    /* Extra large avatars, profile pages */

/* Icons */
--size-icon-xs: 12px;      /* Tiny status indicators */
--size-icon-sm: 16px;      /* Small icons, inline with text */
--size-icon-md: 20px;      /* Standard icons, buttons */
--size-icon-lg: 24px;      /* Large icons, navigation */
--size-icon-xl: 32px;      /* Extra large icons, heroes */
```

---

## Component Themes

### Button Styles
```css
/* Primary Button */
.btn-primary {
  background: var(--accent-primary);
  color: var(--text-inverse);
  border: var(--border-thin) solid var(--accent-primary);
  box-shadow: var(--glow-green);
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  background: var(--accent-secondary);
  box-shadow: var(--glow-green), var(--shadow-md);
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--accent-primary);
  border: var(--border-thin) solid var(--accent-primary);
  transition: all 0.2s ease-in-out;
}

.btn-secondary:hover {
  background: var(--accent-primary);
  color: var(--text-inverse);
  box-shadow: var(--glow-green);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  transition: all 0.2s ease-in-out;
}

.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}
```

### Card Styles
```css
/* Standard Card */
.card {
  background: var(--bg-secondary);
  border: var(--border-thin) solid var(--border-primary);
  border-radius: 8px;
  padding: var(--space-4);
  transition: all 0.2s ease-in-out;
}

.card:hover {
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-sm);
}

/* Interactive Card */
.card-interactive {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.card-interactive:hover {
  background: var(--bg-hover);
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* Post Card */
.post-card {
  background: var(--bg-secondary);
  border: var(--border-thin) solid var(--border-primary);
  border-radius: 0; /* Sharp edges for technical aesthetic */
  padding: var(--space-4);
  margin-bottom: var(--space-2);
  transition: all 0.2s ease-in-out;
}

.post-card:hover {
  border-color: var(--border-secondary);
  background: var(--bg-hover);
}
```

### Form Styles
```css
/* Input Fields */
.input {
  background: var(--bg-tertiary);
  border: var(--border-thin) solid var(--border-primary);
  color: var(--text-primary);
  padding: var(--space-3) var(--space-4);
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
}

.input:focus {
  outline: none;
  border-color: var(--border-accent);
  box-shadow: 0 0 0 3px rgba(0, 255, 65, 0.1);
  background: var(--bg-secondary);
}

.input::placeholder {
  color: var(--text-tertiary);
  font-style: italic;
}

/* Textarea */
.textarea {
  background: var(--bg-tertiary);
  border: var(--border-thin) solid var(--border-primary);
  color: var(--text-primary);
  padding: var(--space-4);
  border-radius: 4px;
  resize: vertical;
  font-family: var(--font-sans);
  line-height: var(--leading-normal);
  transition: all 0.2s ease-in-out;
}

.textarea:focus {
  outline: none;
  border-color: var(--border-accent);
  box-shadow: 0 0 0 3px rgba(0, 255, 65, 0.1);
  background: var(--bg-secondary);
}
```

---

## Animation & Transitions

### Transition Timing
```css
/* Duration */
--transition-fast: 0.1s;      /* Quick feedback */
--transition-normal: 0.2s;    /* Standard transitions */
--transition-slow: 0.3s;      /* Deliberate transitions */
--transition-lazy: 0.5s;      /* Attention-drawing transitions */

/* Easing Functions */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Animation Keyframes
```css
/* Glow Animation */
@keyframes glow {
  0%, 100% { box-shadow: var(--glow-green); }
  50% { box-shadow: 0 0 20px rgba(0, 255, 65, 0.5); }
}

/* Pulse Animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scale Click */
@keyframes scaleClick {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

/* Loading Spin */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## State Variations

### Interactive States
```css
/* Hover States */
.interactive:hover {
  color: var(--accent-primary);
  transition: color var(--transition-normal) var(--ease-out);
}

/* Active/Pressed States */
.interactive:active {
  transform: scale(0.98);
  transition: transform var(--transition-fast) var(--ease-in-out);
}

/* Focus States */
.interactive:focus {
  outline: var(--border-thick) solid var(--border-accent);
  outline-offset: 2px;
}

/* Disabled States */
.interactive:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--text-quaternary);
}
```

### Loading States
```css
/* Skeleton Loading */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-hover) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Spinner */
.spinner {
  border: 2px solid var(--border-primary);
  border-top: 2px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

---

## Responsive Theme Adaptations

### Mobile Adjustments
```css
/* Mobile-specific spacing */
@media (max-width: 768px) {
  :root {
    --space-page-margin: var(--space-4);
    --size-button-md: 44px;  /* Larger touch targets */
    --size-input-md: 48px;   /* Larger inputs */
  }
}

/* Large screen optimizations */
@media (min-width: 1440px) {
  :root {
    --space-page-margin: var(--space-16);
    --text-base: 1.125rem;   /* Slightly larger text */
  }
}
```

### Dark Mode Variations
```css
/* Enhanced dark mode (default) */
.theme-dark-enhanced {
  --bg-primary: #000000;
  --text-primary: #ffffff;
  --accent-primary: #00ff41;
}

/* Softer dark mode (optional) */
.theme-dark-soft {
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --text-primary: #f0f6fc;
  --accent-primary: #33ff66;
}
```

---

## Implementation Guidelines

### CSS Variable Usage
```css
/* Preferred approach - using semantic variables */
.component {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: var(--border-thin) solid var(--border-primary);
}

/* Avoid hardcoding colors */
.component-bad {
  background: #0a0a0a; /* Don't do this */
  color: #ffffff;      /* Use variables instead */
}
```

### Tailwind CSS Integration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'cyber-black': 'var(--bg-primary)',
        'cyber-dark': 'var(--bg-secondary)',
        'cyber-grey': 'var(--bg-tertiary)',
        'cyber-green': 'var(--accent-primary)',
        'cyber-green': 'var(--success)',
        'cyber-orange': 'var(--warning)',
        'cyber-red': 'var(--error)',
        'bitcoin': 'var(--bitcoin)',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    }
  }
}
```

### Component Examples
```css
/* Post component styling */
.post {
  background: var(--bg-secondary);
  border-left: var(--border-thin) solid var(--border-primary);
  padding: var(--space-4);
  transition: all var(--transition-normal) var(--ease-in-out);
}

.post:hover {
  border-left-color: var(--accent-primary);
  background: var(--bg-hover);
}

.post-username {
  color: var(--text-primary);
  font-weight: var(--font-medium);
  font-size: var(--text-lg);
}

.post-timestamp {
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.post-content {
  color: var(--text-primary);
  line-height: var(--leading-normal);
  margin: var(--space-3) 0;
}
```

---

## Theme Utilities & Helpers

### JavaScript Theme Utilities
The theme system includes comprehensive utilities for programmatic access:

```typescript
// Theme utilities available in src/utils/theme.ts
import { 
  THEME_COLORS, 
  getButtonClasses, 
  getStatusColor, 
  getCurrentTheme,
  isThemeLoaded 
} from '@/utils/theme';

// Get button classes for consistent styling
const buttonClasses = getButtonClasses('primary', 'lg');

// Get status-appropriate colors
const statusColor = getStatusColor('connected'); // Returns success green

// Access theme colors programmatically
const accentColor = THEME_COLORS.accent.primary;

// Validate theme system is loaded
if (isThemeLoaded()) {
  console.log('Matrix green theme loaded successfully');
}
```

### Pre-built Style Objects
```typescript
// Use pre-built styles for common components
import { THEME_STYLES } from '@/utils/theme';

// Status indicators with appropriate colors and effects
<div style={THEME_STYLES.statusIndicator.connected} />
<div style={THEME_STYLES.statusIndicator.connecting} />

// Loading spinners with theme-appropriate styling  
<div style={THEME_STYLES.loadingSpinner.base} />

// Glow effects for enhanced visual feedback
<div style={THEME_STYLES.glowEffects.green} />
```

### Runtime Theme Customization
```typescript
// Dynamic theme adjustments at runtime
import { setCSSVariable, getCSSVariable } from '@/utils/theme';

// Temporarily adjust accent color for special states
setCSSVariable('--accent-primary', '#33ff66');

// Read current theme values
const currentAccent = getCSSVariable('--accent-primary');
```

---

## Summary

This theme system provides a comprehensive foundation for maintaining visual consistency throughout the application while supporting the **matrix green cypherpunk aesthetic** that aligns with the Nostr protocol's values of privacy, decentralization, and technical excellence. 