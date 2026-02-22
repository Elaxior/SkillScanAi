/**
 * SkillScan AI Border Radius System
 * 
 * Consistent rounded corners create visual harmony.
 * We favor larger radii for a modern, soft look.
 */

export const radius = {
  // ==========================================
  // BASE RADII
  // ==========================================
  
  none: '0',
  sm: '0.25rem',      // 4px - Small elements, tags
  md: '0.375rem',     // 6px - Inputs, small buttons
  DEFAULT: '0.5rem',  // 8px - Standard radius
  lg: '0.75rem',      // 12px - Cards, larger buttons
  xl: '1rem',         // 16px - Modal corners
  '2xl': '1.5rem',    // 24px - Large cards
  '3xl': '2rem',      // 32px - Hero sections
  full: '9999px',     // Pills, avatars

  // ==========================================
  // COMPONENT-SPECIFIC PRESETS
  // ==========================================

  button: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    pill: '9999px',
  },

  card: {
    sm: '0.75rem',    // 12px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
  },

  input: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
  },

  badge: '9999px',    // Always pill-shaped
  
  avatar: '9999px',   // Always circular
  
  modal: '1.5rem',    // 24px
  
  tooltip: '0.5rem',  // 8px
} as const

export type RadiusKey = keyof typeof radius