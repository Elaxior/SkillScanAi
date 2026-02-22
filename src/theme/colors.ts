/**
 * SkillScan AI Color System
 * 
 * A dark, modern color palette with electric accent colors
 * designed for AI/tech product interfaces.
 * 
 * Color naming convention:
 * - Semantic names (primary, accent) for brand colors
 * - Descriptive names (background, surface) for UI structure
 * - State names (success, warning, danger) for feedback
 */

export const colors = {
  // ==========================================
  // BRAND COLORS
  // ==========================================
  
  // Primary - Electric Blue (Main CTA, links)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
    DEFAULT: '#3b82f6',
  },

  // Accent - Cyan/Neon (Highlights, glow effects)
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

  // ==========================================
  // BACKGROUND & SURFACE COLORS
  // ==========================================

  // Dark backgrounds
  background: {
    primary: '#0a0a0f',      // Main app background
    secondary: '#12121a',    // Slightly lighter sections
    tertiary: '#1a1a24',     // Cards, elevated surfaces
    elevated: '#222230',     // Modals, popovers
  },

  // Surface colors (for cards, inputs, etc.)
  surface: {
    DEFAULT: '#1a1a24',
    light: '#222230',
    lighter: '#2a2a3a',
    border: '#2e2e3e',
    borderLight: '#3a3a4a',
  },

  // ==========================================
  // TEXT COLORS
  // ==========================================

  text: {
    primary: '#ffffff',
    secondary: '#a1a1aa',     // Muted text
    tertiary: '#71717a',      // Very muted
    disabled: '#52525b',
    inverse: '#0a0a0f',
  },

  // ==========================================
  // SEMANTIC/STATE COLORS
  // ==========================================

  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    DEFAULT: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.4)',
  },

  warning: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    DEFAULT: '#eab308',
    glow: 'rgba(234, 179, 8, 0.4)',
  },

  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    DEFAULT: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.4)',
  },

  // Info state
  info: {
    DEFAULT: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
  },

  // ==========================================
  // SPORT-SPECIFIC COLORS (for future features)
  // ==========================================

  sports: {
    soccer: '#22c55e',
    basketball: '#f97316',
    tennis: '#84cc16',
    golf: '#14b8a6',
    baseball: '#ef4444',
    swimming: '#0ea5e9',
    running: '#8b5cf6',
    boxing: '#ec4899',
  },

  // ==========================================
  // SPECIAL EFFECTS
  // ==========================================

  glow: {
    primary: 'rgba(59, 130, 246, 0.5)',
    accent: 'rgba(6, 182, 212, 0.5)',
    success: 'rgba(34, 197, 94, 0.5)',
    warning: 'rgba(234, 179, 8, 0.5)',
    danger: 'rgba(239, 68, 68, 0.5)',
  },

  // Gradient presets (as CSS values)
  gradients: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    accent: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
    success: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
    warning: 'linear-gradient(135deg, #eab308 0%, #facc15 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    dark: 'linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)',
    card: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  },
} as const

// Type exports for TypeScript
export type ColorKey = keyof typeof colors
export type PrimaryShade = keyof typeof colors.primary
export type AccentShade = keyof typeof colors.accent
export type BackgroundKey = keyof typeof colors.background
export type TextColorKey = keyof typeof colors.text