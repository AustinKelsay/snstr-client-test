/**
 * @fileoverview Tailwind CSS configuration
 * Integrates with the cypherpunk theme system defined in globals.css
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom colors mapping to CSS variables
      colors: {
        // Background colors
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'bg-quaternary': 'var(--bg-quaternary)',
        'bg-hover': 'var(--bg-hover)',
        'bg-active': 'var(--bg-active)',
        'bg-selected': 'var(--bg-selected)',

        // Text colors
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-quaternary': 'var(--text-quaternary)',
        'text-link': 'var(--text-link)',
        'text-link-hover': 'var(--text-link-hover)',
        'text-inverse': 'var(--text-inverse)',

        // Accent colors - Matrix green cypherpunk theme
        'accent-primary': 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        'accent-tertiary': 'var(--accent-tertiary)',

        // Semantic colors
        'success': 'var(--success)',
        'warning': 'var(--warning)',
        'error': 'var(--error)',
        'info': 'var(--info)',

        // Special purpose colors
        'bitcoin': 'var(--bitcoin)',
        'nostr': 'var(--nostr)',
        'verification': 'var(--verification)',

        // Border colors
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'border-accent': 'var(--border-accent)',
        'border-error': 'var(--border-error)',
        'border-success': 'var(--border-success)',

        // shadcn/ui compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },

      // Font families
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', 'monospace'],
      },

      // Font sizes using CSS variables
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)', 
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
      },

      // Line heights
      lineHeight: {
        'tight': 'var(--leading-tight)',
        'normal': 'var(--leading-normal)',
        'relaxed': 'var(--leading-relaxed)',
        'loose': 'var(--leading-loose)',
      },

      // Spacing using CSS variables
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
      },

      // Box shadows
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow-green': 'var(--glow-green)',
        'glow-success': 'var(--glow-success)',
        'glow-orange': 'var(--glow-orange)',
        'glow-red': 'var(--glow-red)',
      },

      // Border radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // Animation durations
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'normal': 'var(--transition-normal)',
        'slow': 'var(--transition-slow)',
        'lazy': 'var(--transition-lazy)',
      },

      // Animation timing functions
      transitionTimingFunction: {
        'ease-in-out': 'var(--ease-in-out)',
        'ease-out': 'var(--ease-out)',
        'ease-in': 'var(--ease-in)',
        'bounce': 'var(--ease-bounce)',
      },

      // Custom component sizes
      width: {
        'button-sm': 'var(--size-button-sm)',
        'button-md': 'var(--size-button-md)',
        'button-lg': 'var(--size-button-lg)',
        'avatar-xs': 'var(--size-avatar-xs)',
        'avatar-sm': 'var(--size-avatar-sm)',
        'avatar-md': 'var(--size-avatar-md)',
        'avatar-lg': 'var(--size-avatar-lg)',
        'avatar-xl': 'var(--size-avatar-xl)',
      },

      height: {
        'button-sm': 'var(--size-button-sm)',
        'button-md': 'var(--size-button-md)',
        'button-lg': 'var(--size-button-lg)',
        'input-sm': 'var(--size-input-sm)',
        'input-md': 'var(--size-input-md)',
        'input-lg': 'var(--size-input-lg)',
        'avatar-xs': 'var(--size-avatar-xs)',
        'avatar-sm': 'var(--size-avatar-sm)',
        'avatar-md': 'var(--size-avatar-md)',
        'avatar-lg': 'var(--size-avatar-lg)',
        'avatar-xl': 'var(--size-avatar-xl)',
      },

      // Custom keyframes
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        glow: {
          '0%, 100%': { boxShadow: 'var(--glow-green)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // Animation utilities
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
} 