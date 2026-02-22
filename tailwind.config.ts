import type { Config } from 'tailwindcss'

const config: Config = {
  // ==========================================
  // CONTENT - Where to scan for classes
  // ==========================================
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // ==========================================
  // DARK MODE - Class-based for manual toggle
  // ==========================================
  darkMode: 'class',

  // ==========================================
  // THEME EXTENSIONS
  // ==========================================
  theme: {
    extend: {
      // ----------------------------------------
      // COLORS
      // ----------------------------------------
      colors: {
        // Background colors
        background: {
          DEFAULT: '#080809',
          primary: '#080809',
          secondary: '#0D0D0F',
          tertiary: '#111114',
          elevated: '#17171C',
        },

        // Surface colors
        surface: {
          DEFAULT: '#111114',
          light: '#17171C',
          lighter: '#1E1E25',
          border: '#24242E',
          'border-light': '#2E2E3A',
        },

        // Primary (Gold / Amber — matches the military HUD aesthetic)
        primary: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#3B1A05',
          DEFAULT: '#F59E0B',
        },

        // Accent (Cyan — kept for contrast / data highlights)
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
          DEFAULT: '#06b6d4',
        },

        // Success (Green)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          DEFAULT: '#22c55e',
        },

        // Warning (Yellow)
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          DEFAULT: '#eab308',
        },

        // Danger (Red)
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          DEFAULT: '#ef4444',
        },

        // Text colors
        'text-primary': '#F5F5F5',
        'text-secondary': '#9CA3AF',
        'text-tertiary': '#6B7280',
        'text-disabled': '#4B5563',
        // Gold shorthand
        gold: '#F59E0B',
      },

      // ----------------------------------------
      // FONT FAMILY
      // ----------------------------------------
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Barlow Condensed', 'Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Barlow Condensed', 'Impact', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // ----------------------------------------
      // FONT SIZE
      // ----------------------------------------
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px
        // ... Tailwind defaults are kept
      },

      // ----------------------------------------
      // BORDER RADIUS
      // ----------------------------------------
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ----------------------------------------
      // SHADOWS
      // ----------------------------------------
      boxShadow: {
        // Glow effects — primary is now gold
        'glow-primary': '0 0 20px rgba(245, 158, 11, 0.45), 0 0 40px rgba(245, 158, 11, 0.2)',
        'glow-primary-sm': '0 0 10px rgba(245, 158, 11, 0.35)',
        'glow-primary-lg': '0 0 30px rgba(245, 158, 11, 0.55), 0 0 60px rgba(245, 158, 11, 0.3)',
        
        'glow-accent': '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)',
        'glow-accent-sm': '0 0 10px rgba(6, 182, 212, 0.3)',
        'glow-accent-lg': '0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)',

        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245, 158, 11, 0.25)',
        'glow-gold-sm': '0 0 8px rgba(245, 158, 11, 0.4)',
        
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)',

        // Dark UI shadows
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        'dark-xl': '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 10px 20px -10px rgba(0, 0, 0, 0.5)',

        // Card shadows
        'card': '0 4px 6px -1px rgba(0,0,0,0.5), 0 2px 4px -2px rgba(0,0,0,0.4)',
        'card-hover': '0 10px 25px -5px rgba(0,0,0,0.6), 0 0 20px rgba(245, 158, 11, 0.15)',
      },

      // ----------------------------------------
      // BACKGROUND IMAGE (Gradients)
      // ----------------------------------------
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'gradient-accent': 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
        'gradient-success': 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
        'gradient-dark': 'linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
      },

      // ----------------------------------------
      // ANIMATION & TRANSITIONS
      // ----------------------------------------
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'progress': 'progress 1s ease-out forwards',
        'score-ring': 'scoreRing 1.5s ease-out forwards',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
        scoreRing: {
          '0%': { strokeDashoffset: 'var(--circumference)' },
          '100%': { strokeDashoffset: 'var(--dash-offset)' },
        },
      },

      // ----------------------------------------
      // TRANSITION DURATION
      // ----------------------------------------
      transitionDuration: {
        '400': '400ms',
      },

      // ----------------------------------------
      // BACKDROP BLUR
      // ----------------------------------------
      backdropBlur: {
        xs: '2px',
      },

      // ----------------------------------------
      // SPACING
      // ----------------------------------------
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
      },
    },
  },

  // ==========================================
  // PLUGINS
  // ==========================================
  plugins: [],
}

export default config