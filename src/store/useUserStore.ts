/**
 * User Store - Zustand
 * 
 * Manages user profile and preferences.
 * Persists to localStorage for cross-session retention.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  Sport,
  HeightUnit,
  SkillLevel,
  UserPreferences,
  DEFAULT_PREFERENCES,
  convertHeight,
} from '@/types'

// ==========================================
// STORE STATE TYPE
// ==========================================

interface UserState {
  // Profile data
  height: number | null
  heightUnit: HeightUnit
  selectedSport: Sport | null
  selectedAction: string | null
  skillLevel: SkillLevel
  preferences: UserPreferences
  
  // Computed
  isProfileComplete: boolean
}

interface UserActions {
  // Height management
  setHeight: (height: number | null) => void
  setHeightUnit: (unit: HeightUnit) => void
  
  // Sport selection
  setSport: (sport: Sport | null) => void
  setAction: (actionId: string | null) => void
  
  // Skill level
  setSkillLevel: (level: SkillLevel) => void
  
  // Preferences
  setPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void
  resetPreferences: () => void
  
  // Full reset
  resetUser: () => void
}

type UserStore = UserState & UserActions

// ==========================================
// INITIAL STATE
// ==========================================

const initialState: UserState = {
  height: null,
  heightUnit: 'cm',
  selectedSport: null,
  selectedAction: null,
  skillLevel: SkillLevel.INTERMEDIATE,
  preferences: DEFAULT_PREFERENCES,
  isProfileComplete: false,
}

// ==========================================
// STORE IMPLEMENTATION
// ==========================================

/**
 * User store with localStorage persistence
 * 
 * How persist middleware works:
 * 1. On store creation, loads saved state from localStorage
 * 2. On every state change, serializes and saves to localStorage
 * 3. Uses JSON serialization by default
 * 4. Handles hydration automatically
 */
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

      // ----------------------------------------
      // HEIGHT MANAGEMENT
      // ----------------------------------------
      
      setHeight: (height) => {
        set((state) => ({
          height,
          isProfileComplete: height !== null && state.selectedSport !== null,
        }))
      },

      setHeightUnit: (unit) => {
        const currentHeight = get().height
        const currentUnit = get().heightUnit
        
        // Convert existing height to new unit
        const convertedHeight = currentHeight !== null
          ? convertHeight(currentHeight, currentUnit, unit)
          : null
        
        set({
          heightUnit: unit,
          height: convertedHeight,
        })
      },

      // ----------------------------------------
      // SPORT SELECTION
      // ----------------------------------------
      
      setSport: (sport) => {
        set((state) => ({
          selectedSport: sport,
          // Reset action when sport changes
          selectedAction: null,
          isProfileComplete: state.height !== null && sport !== null,
        }))
      },

      setAction: (actionId) => {
        set({ selectedAction: actionId })
      },

      // ----------------------------------------
      // SKILL LEVEL
      // ----------------------------------------
      
      setSkillLevel: (level) => {
        set({ skillLevel: level })
      },

      // ----------------------------------------
      // PREFERENCES
      // ----------------------------------------
      
      setPreference: (key, value) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        }))
      },

      resetPreferences: () => {
        set({ preferences: DEFAULT_PREFERENCES })
      },

      // ----------------------------------------
      // FULL RESET
      // ----------------------------------------
      
      resetUser: () => {
        set(initialState)
      },
    }),
    {
      // Persistence configuration
      name: 'skillscan-user',
      
      // Use localStorage
      storage: createJSONStorage(() => localStorage),
      
      // Only persist these fields (not computed values)
      partialize: (state) => ({
        height: state.height,
        heightUnit: state.heightUnit,
        selectedSport: state.selectedSport,
        selectedAction: state.selectedAction,
        skillLevel: state.skillLevel,
        preferences: state.preferences,
      }),
      
      // Version for migrations
      version: 1,
      
      // Handle version migrations
      migrate: (persistedState: unknown, version: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = persistedState as any
        
        if (version === 0) {
          // Migration from version 0 to 1
          // Add any new fields with defaults
          return {
            ...state,
            skillLevel: state.skillLevel || SkillLevel.INTERMEDIATE,
            preferences: {
              ...DEFAULT_PREFERENCES,
              ...state.preferences,
            },
          }
        }
        
        return state as UserState
      },
    }
  )
)

// ==========================================
// SELECTOR HOOKS (for optimized re-renders)
// ==========================================

/**
 * Select only height data
 */
export const useUserHeight = () =>
  useUserStore((state) => ({
    height: state.height,
    heightUnit: state.heightUnit,
    setHeight: state.setHeight,
    setHeightUnit: state.setHeightUnit,
  }))

/**
 * Select only sport data
 */
export const useUserSport = () =>
  useUserStore((state) => ({
    selectedSport: state.selectedSport,
    selectedAction: state.selectedAction,
    setSport: state.setSport,
    setAction: state.setAction,
  }))

/**
 * Select only preferences
 */
export const useUserPreferences = () =>
  useUserStore((state) => ({
    preferences: state.preferences,
    setPreference: state.setPreference,
    resetPreferences: state.resetPreferences,
  }))

export default useUserStore