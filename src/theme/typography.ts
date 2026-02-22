/**
 * SkillScan AI Typography System
 * 
 * Uses Inter for body text (clean, readable)
 * Uses Space Grotesk for headings (techy, modern)
 */

export const typography = {
  // ==========================================
  // FONT FAMILIES
  // ==========================================
  
  fonts: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    heading: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },

  // ==========================================
  // FONT SIZES (with line heights)
  // ==========================================

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],        // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],       // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1.15' }],        // 48px
    '6xl': ['3.75rem', { lineHeight: '1.1' }],      // 60px
    '7xl': ['4.5rem', { lineHeight: '1.05' }],      // 72px
  },

  // ==========================================
  // FONT WEIGHTS
  // ==========================================

  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // ==========================================
  // LETTER SPACING
  // ==========================================

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // ==========================================
  // HEADING PRESETS
  // ==========================================

  headings: {
    h1: {
      fontSize: '3rem',         // 48px
      lineHeight: '1.15',
      fontWeight: '700',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.25rem',      // 36px
      lineHeight: '2.5rem',
      fontWeight: '700',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.875rem',     // 30px
      lineHeight: '2.25rem',
      fontWeight: '600',
      letterSpacing: '-0.015em',
    },
    h4: {
      fontSize: '1.5rem',       // 24px
      lineHeight: '2rem',
      fontWeight: '600',
      letterSpacing: '0',
    },
    h5: {
      fontSize: '1.25rem',      // 20px
      lineHeight: '1.75rem',
      fontWeight: '600',
      letterSpacing: '0',
    },
    h6: {
      fontSize: '1.125rem',     // 18px
      lineHeight: '1.75rem',
      fontWeight: '600',
      letterSpacing: '0',
    },
  },
} as const

export type FontSize = keyof typeof typography.fontSize
export type FontWeight = keyof typeof typography.fontWeight