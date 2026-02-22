/**
 * User Types for SkillScan AI
 * 
 * User preferences and profile data that persists across sessions.
 */

import { Sport } from './sport'

// ==========================================
// MEASUREMENT UNITS
// ==========================================

/**
 * Height measurement unit
 */
export type HeightUnit = 'cm' | 'inches'

/**
 * Weight measurement unit (future)
 */
export type WeightUnit = 'kg' | 'lbs'

// ==========================================
// USER PROFILE
// ==========================================

/**
 * User profile and preferences
 */
export interface UserProfile {
  /** User's height for calibration */
  height: number | null
  
  /** Preferred height unit */
  heightUnit: HeightUnit
  
  /** Currently selected sport */
  selectedSport: Sport | null
  
  /** Currently selected action within sport */
  selectedAction: string | null
  
  /** User's skill level (for pro comparison calibration) */
  skillLevel: SkillLevel
  
  /** Preferences */
  preferences: UserPreferences
}

/**
 * User skill level
 */
export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PROFESSIONAL = 'professional',
}

/**
 * User preferences
 */
export interface UserPreferences {
  /** Enable sound effects */
  soundEnabled: boolean
  
  /** Show skeleton overlay on video */
  showSkeleton: boolean
  
  /** Auto-start recording after countdown */
  autoRecord: boolean
  
  /** Save recordings locally */
  saveRecordings: boolean
  
  /** Video quality preference */
  videoQuality: 'low' | 'medium' | 'high'
  
  /** Camera preference */
  preferredCamera: 'front' | 'back'
}

// ==========================================
// DEFAULT VALUES
// ==========================================

/**
 * Default user preferences
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  soundEnabled: true,
  showSkeleton: true,
  autoRecord: false,
  saveRecordings: false,
  videoQuality: 'high',
  preferredCamera: 'front',
}

/**
 * Default user profile
 */
export const DEFAULT_USER_PROFILE: UserProfile = {
  height: null,
  heightUnit: 'cm',
  selectedSport: null,
  selectedAction: null,
  skillLevel: SkillLevel.INTERMEDIATE,
  preferences: DEFAULT_PREFERENCES,
}

// ==========================================
// HEIGHT HELPERS
// ==========================================

/**
 * Convert height between units
 */
export function convertHeight(value: number, from: HeightUnit, to: HeightUnit): number {
  if (from === to) return value
  
  if (from === 'cm' && to === 'inches') {
    return Math.round(value / 2.54 * 10) / 10
  }
  
  if (from === 'inches' && to === 'cm') {
    return Math.round(value * 2.54)
  }
  
  return value
}

/**
 * Format height for display
 */
export function formatHeight(value: number | null, unit: HeightUnit): string {
  if (value === null) return 'Not set'
  
  if (unit === 'cm') {
    return `${value} cm`
  }
  
  // Convert to feet and inches
  const totalInches = value
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  
  return `${feet}'${inches}"`
}

/**
 * Validate height value
 */
export function isValidHeight(value: number, unit: HeightUnit): boolean {
  if (unit === 'cm') {
    return value >= 100 && value <= 250
  }
  // inches
  return value >= 39 && value <= 98
}