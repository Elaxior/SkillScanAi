/**
 * SkillScan AI Shadow System
 * 
 * Dark UI shadows work differently than light UIs.
 * We use subtle shadows with color tints for glow effects.
 */

export const shadows = {
  // ==========================================
  // STANDARD SHADOWS
  // ==========================================

  none: 'none',
  
  // Subtle elevation
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
  
  // Default card shadow
  DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  
  // Medium elevation
  md: '0 6px 12px -2px rgba(0, 0, 0, 0.5), 0 3px 7px -3px rgba(0, 0, 0, 0.4)',
  
  // High elevation (modals, dropdowns)
  lg: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
  
  // Very high elevation
  xl: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 10px 20px -10px rgba(0, 0, 0, 0.5)',
  
  // Maximum elevation
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',

  // Inner shadow
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',

  // ==========================================
  // GLOW SHADOWS (for hover states, emphasis)
  // ==========================================

  glow: {
    // Primary blue glow
    primary: '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)',
    primarySm: '0 0 10px rgba(59, 130, 246, 0.3)',
    primaryLg: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)',

    // Accent cyan glow
    accent: '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)',
    accentSm: '0 0 10px rgba(6, 182, 212, 0.3)',
    accentLg: '0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)',

    // Success green glow
    success: '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)',

    // Warning yellow glow
    warning: '0 0 20px rgba(234, 179, 8, 0.4), 0 0 40px rgba(234, 179, 8, 0.2)',

    // Danger red glow
    danger: '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)',

    // White subtle glow
    white: '0 0 15px rgba(255, 255, 255, 0.1)',
  },

  // ==========================================
  // COMPONENT-SPECIFIC SHADOWS
  // ==========================================

  card: {
    DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    hover: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.15)',
    active: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  },

  button: {
    DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.3)',
    hover: '0 4px 12px rgba(0, 0, 0, 0.4)',
    primary: '0 4px 14px rgba(59, 130, 246, 0.4)',
    primaryHover: '0 6px 20px rgba(59, 130, 246, 0.5)',
  },

  input: {
    focus: '0 0 0 3px rgba(59, 130, 246, 0.3)',
  },
} as const

export type ShadowKey = keyof typeof shadows
export type GlowKey = keyof typeof shadows.glow