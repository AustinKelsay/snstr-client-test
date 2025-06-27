/**
 * @fileoverview Theme utilities and helpers
 * Provides programmatic access to the cypherpunk theme system
 * Includes helper functions, theme constants, and utility classes
 */

// =============================================================================
// THEME CONSTANTS
// =============================================================================

/**
 * Color palette constants for programmatic access to theme colors
 */
export const THEME_COLORS = {
  // Background colors
  background: {
    primary: 'var(--bg-primary)',
    secondary: 'var(--bg-secondary)',
    tertiary: 'var(--bg-tertiary)',
    quaternary: 'var(--bg-quaternary)',
    hover: 'var(--bg-hover)',
    active: 'var(--bg-active)',
    selected: 'var(--bg-selected)',
  },

  // Text colors
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    tertiary: 'var(--text-tertiary)',
    quaternary: 'var(--text-quaternary)',
    link: 'var(--text-link)',
    linkHover: 'var(--text-link-hover)',
    inverse: 'var(--text-inverse)',
  },

  // Accent colors - Matrix green cypherpunk theme
  accent: {
    primary: 'var(--accent-primary)',
    secondary: 'var(--accent-secondary)',
    tertiary: 'var(--accent-tertiary)',
  },

  // Semantic colors
  semantic: {
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
    info: 'var(--info)',
  },

  // Special purpose colors
  special: {
    bitcoin: 'var(--bitcoin)',
    nostr: 'var(--nostr)',
    verification: 'var(--verification)',
  },

  // Border colors
  border: {
    primary: 'var(--border-primary)',
    secondary: 'var(--border-secondary)',
    accent: 'var(--border-accent)',
    error: 'var(--border-error)',
    success: 'var(--border-success)',
  },
} as const;

/**
 * Spacing scale constants
 */
export const THEME_SPACING = {
  space1: 'var(--space-1)',   // 4px
  space2: 'var(--space-2)',   // 8px
  space3: 'var(--space-3)',   // 12px
  space4: 'var(--space-4)',   // 16px
  space6: 'var(--space-6)',   // 24px
  space8: 'var(--space-8)',   // 32px
  space12: 'var(--space-12)', // 48px
  space16: 'var(--space-16)', // 64px
} as const;

/**
 * Component size constants
 */
export const THEME_SIZES = {
  button: {
    sm: 'var(--size-button-sm)',
    md: 'var(--size-button-md)',
    lg: 'var(--size-button-lg)',
  },
  input: {
    sm: 'var(--size-input-sm)',
    md: 'var(--size-input-md)',
    lg: 'var(--size-input-lg)',
  },
  avatar: {
    xs: 'var(--size-avatar-xs)',
    sm: 'var(--size-avatar-sm)',
    md: 'var(--size-avatar-md)',
    lg: 'var(--size-avatar-lg)',
    xl: 'var(--size-avatar-xl)',
  },
  icon: {
    xs: 'var(--size-icon-xs)',
    sm: 'var(--size-icon-sm)',
    md: 'var(--size-icon-md)',
    lg: 'var(--size-icon-lg)',
    xl: 'var(--size-icon-xl)',
  },
} as const;

// =============================================================================
// THEME UTILITY FUNCTIONS
// =============================================================================

/**
 * Gets a CSS variable value at runtime
 * Useful for programmatic access to theme values
 * 
 * @param variableName - CSS variable name (with or without --)
 * @returns The computed CSS variable value
 * 
 * @example
 * const primaryBg = getCSSVariable('--bg-primary')
 * const accentColor = getCSSVariable('accent-primary')
 */
export function getCSSVariable(variableName: string): string {
  const varName = variableName.startsWith('--') ? variableName : `--${variableName}`;
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

/**
 * Sets a CSS variable value dynamically
 * Useful for runtime theme customization
 * 
 * @param variableName - CSS variable name (with or without --)
 * @param value - New value for the CSS variable
 * 
 * @example
 * setCSSVariable('--accent-primary', '#ff00ff')
 * setCSSVariable('accent-secondary', 'rgb(255, 0, 128)')
 */
export function setCSSVariable(variableName: string, value: string): void {
  const varName = variableName.startsWith('--') ? variableName : `--${variableName}`;
  document.documentElement.style.setProperty(varName, value);
}

/**
 * Status indicator color helper
 * Returns appropriate color based on connection/status state
 * 
 * @param status - Status type
 * @returns CSS color value
 * 
 * @example
 * const color = getStatusColor('connected') // returns success green
 * const color = getStatusColor('error') // returns error red
 */
export function getStatusColor(
  status: 'connected' | 'connecting' | 'disconnected' | 'error' | 'warning' | 'pending'
): string {
  switch (status) {
    case 'connected':
      return THEME_COLORS.semantic.success;
    case 'connecting':
    case 'pending':
      return THEME_COLORS.accent.primary;
    case 'warning':
      return THEME_COLORS.semantic.warning;
    case 'error':
      return THEME_COLORS.semantic.error;
    case 'disconnected':
      return THEME_COLORS.text.tertiary;
    default:
      return THEME_COLORS.text.secondary;
  }
}

/**
 * Button variant class helper
 * Returns appropriate CSS classes for button variants
 * 
 * @param variant - Button variant
 * @param size - Button size
 * @param disabled - Whether button is disabled
 * @returns Space-separated CSS class string
 * 
 * @example
 * const classes = getButtonClasses('primary', 'lg', false)
 * // returns: 'btn-base btn-primary btn-lg'
 */
export function getButtonClasses(
  variant: 'primary' | 'secondary' | 'ghost' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md',
  disabled: boolean = false
): string {
  const baseClasses = ['btn-base'];
  
  // Add variant class
  baseClasses.push(`btn-${variant}`);
  
  // Add size class
  baseClasses.push(`btn-${size}`);
  
  // Add disabled class
  if (disabled) {
    baseClasses.push('btn-disabled');
  }
  
  return baseClasses.join(' ');
}

/**
 * Text variant class helper
 * Returns appropriate CSS classes for text variants
 * 
 * @param variant - Text variant
 * @returns CSS class string
 * 
 * @example
 * const classes = getTextClasses('username')
 * // returns: 'text-username'
 */
export function getTextClasses(
  variant: 'username' | 'timestamp' | 'technical' | 'emphasis'
): string {
  return `text-${variant}`;
}

/**
 * Card variant class helper
 * Returns appropriate CSS classes for card variants
 * 
 * @param interactive - Whether card is interactive
 * @param variant - Card variant
 * @returns Space-separated CSS class string
 * 
 * @example
 * const classes = getCardClasses(true, 'post')
 * // returns: 'card card-interactive post-card'
 */
export function getCardClasses(
  interactive: boolean = false,
  variant?: 'post'
): string {
  const baseClasses = ['card'];
  
  if (interactive) {
    baseClasses.push('card-interactive');
  }
  
  if (variant) {
    baseClasses.push(`${variant}-card`);
  }
  
  return baseClasses.join(' ');
}

// =============================================================================
// THEME VALIDATION HELPERS
// =============================================================================

/**
 * Validates if the theme system is properly loaded
 * Checks if key CSS variables are available
 * 
 * @returns Boolean indicating if theme is loaded
 * 
 * @example
 * if (!isThemeLoaded()) {
 *   console.warn('Theme system not properly loaded');
 * }
 */
export function isThemeLoaded(): boolean {
  try {
    const primaryBg = getCSSVariable('--bg-primary');
    const accentColor = getCSSVariable('--accent-primary');
    return Boolean(primaryBg && accentColor);
  } catch {
    return false;
  }
}

/**
 * Gets the current theme configuration object
 * Useful for debugging and theme inspection
 * 
 * @returns Object with current theme values
 * 
 * @example
 * const currentTheme = getCurrentTheme();
 * console.log('Current accent color:', currentTheme.accent.primary);
 */
export function getCurrentTheme() {
  return {
    background: {
      primary: getCSSVariable('--bg-primary'),
      secondary: getCSSVariable('--bg-secondary'),
      tertiary: getCSSVariable('--bg-tertiary'),
    },
    text: {
      primary: getCSSVariable('--text-primary'),
      secondary: getCSSVariable('--text-secondary'),
      tertiary: getCSSVariable('--text-tertiary'),
    },
    accent: {
      primary: getCSSVariable('--accent-primary'),
      secondary: getCSSVariable('--accent-secondary'),
      tertiary: getCSSVariable('--accent-tertiary'),
    },
    semantic: {
      success: getCSSVariable('--success'),
      warning: getCSSVariable('--warning'),
      error: getCSSVariable('--error'),
      info: getCSSVariable('--info'),
    },
  };
}

// =============================================================================
// COMPONENT STYLE OBJECTS
// =============================================================================

/**
 * Pre-built style objects for common components
 * Use these for consistent styling across the application
 */
export const THEME_STYLES = {
  // Status indicator styles
  statusIndicator: {
    connected: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: THEME_COLORS.semantic.success,
      boxShadow: `0 0 6px ${THEME_COLORS.semantic.success}`,
    },
    connecting: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: THEME_COLORS.accent.primary,
      animation: 'pulse 1.5s ease-in-out infinite',
    },
    disconnected: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: THEME_COLORS.text.tertiary,
    },
    error: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: THEME_COLORS.semantic.error,
      boxShadow: `0 0 6px ${THEME_COLORS.semantic.error}`,
    },
  },

  // Loading spinner styles
  loadingSpinner: {
    base: {
      width: '20px',
      height: '20px',
      border: '2px solid transparent',
      borderTop: `2px solid ${THEME_COLORS.accent.primary}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    small: {
      width: '16px',
      height: '16px',
      border: '2px solid transparent',
      borderTop: `2px solid ${THEME_COLORS.accent.primary}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
  },

  // Glow effects
  glowEffects: {
    green: {
      boxShadow: `0 0 10px ${THEME_COLORS.accent.primary}`,
    },
    success: {
      boxShadow: `0 0 10px ${THEME_COLORS.semantic.success}`,
    },
    warning: {
      boxShadow: `0 0 10px ${THEME_COLORS.semantic.warning}`,
    },
    error: {
      boxShadow: `0 0 10px ${THEME_COLORS.semantic.error}`,
    },
  },
} as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ThemeColor = keyof typeof THEME_COLORS;
export type ThemeSpacing = keyof typeof THEME_SPACING;
export type ThemeSize = keyof typeof THEME_SIZES;
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type TextVariant = 'username' | 'timestamp' | 'technical' | 'emphasis';
export type StatusType = 'connected' | 'connecting' | 'disconnected' | 'error' | 'warning' | 'pending'; 