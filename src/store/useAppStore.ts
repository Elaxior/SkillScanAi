/**
 * App Store - Zustand
 * 
 * Manages global UI state that doesn't belong to specific features.
 * Isolated from domain state to prevent unnecessary re-renders.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ==========================================
// THEME TYPE
// ==========================================

type ThemeMode = 'dark' | 'light' | 'system'

// ==========================================
// MODAL/DIALOG STATE
// ==========================================

interface ModalState {
  isOpen: boolean
  type: string | null
  data: Record<string, unknown> | null
}

// ==========================================
// STORE STATE TYPE
// ==========================================

interface AppState {
  // Loading states
  isLoading: boolean
  loadingMessage: string | null
  
  // Theme
  theme: ThemeMode
  
  // Navigation
  previousRoute: string | null
  
  // Modals
  modal: ModalState
  
  // Toast notifications (queue)
  toasts: Toast[]
  
  // Feature flags
  flags: Record<string, boolean>
  
  // Debug mode
  isDebugMode: boolean
}

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface AppActions {
  // Loading
  setLoading: (isLoading: boolean, message?: string | null) => void
  
  // Theme
  setTheme: (theme: ThemeMode) => void
  
  // Navigation
  setPreviousRoute: (route: string | null) => void
  
  // Modal
  openModal: (type: string, data?: Record<string, unknown>) => void
  closeModal: () => void
  
  // Toasts
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  
  // Feature flags
  setFlag: (key: string, value: boolean) => void
  
  // Debug
  toggleDebugMode: () => void
  
  // Reset
  resetApp: () => void
}

type AppStore = AppState & AppActions

// ==========================================
// INITIAL STATE
// ==========================================

const initialState: AppState = {
  isLoading: false,
  loadingMessage: null,
  theme: 'dark',
  previousRoute: null,
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  toasts: [],
  flags: {},
  isDebugMode: false,
}

// ==========================================
// STORE IMPLEMENTATION
// ==========================================

/**
 * App store with selective persistence
 * 
 * Why we isolate UI state from domain state:
 * 1. Different persistence requirements
 * 2. Different update frequencies
 * 3. UI state changes shouldn't trigger domain re-renders
 * 4. Easier testing and debugging
 * 5. Cleaner mental model
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

      // ==========================================
      // LOADING
      // ==========================================
      
      setLoading: (isLoading, message = null) => {
        set({
          isLoading,
          loadingMessage: isLoading ? message : null,
        })
      },

      // ==========================================
      // THEME
      // ==========================================
      
      setTheme: (theme) => {
        set({ theme })
        
        // Update document class for Tailwind dark mode
        if (typeof window !== 'undefined') {
          const root = document.documentElement
          
          if (theme === 'dark') {
            root.classList.add('dark')
          } else if (theme === 'light') {
            root.classList.remove('dark')
          } else {
            // System preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            root.classList.toggle('dark', prefersDark)
          }
        }
      },

      // ==========================================
      // NAVIGATION
      // ==========================================
      
      setPreviousRoute: (route) => {
        set({ previousRoute: route })
      },

      // ==========================================
      // MODAL
      // ==========================================
      
      openModal: (type, data = {}) => {
        set({
          modal: {
            isOpen: true,
            type,
            data,
          },
        })
      },

      closeModal: () => {
        set({
          modal: {
            isOpen: false,
            type: null,
            data: null,
          },
        })
      },

      // ==========================================
      // TOASTS
      // ==========================================
      
      addToast: (toast) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }))
        
        // Auto-remove after duration
        const duration = toast.duration ?? 5000
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, duration)
        }
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      },

      clearToasts: () => {
        set({ toasts: [] })
      },

      // ==========================================
      // FEATURE FLAGS
      // ==========================================
      
      setFlag: (key, value) => {
        set((state) => ({
          flags: {
            ...state.flags,
            [key]: value,
          },
        }))
      },

      // ==========================================
      // DEBUG
      // ==========================================
      
      toggleDebugMode: () => {
        set((state) => ({ isDebugMode: !state.isDebugMode }))
      },

      // ==========================================
      // RESET
      // ==========================================
      
      resetApp: () => {
        set(initialState)
      },
    }),
    {
      name: 'skillscan-app',
      storage: createJSONStorage(() => localStorage),
      
      // Only persist theme and debug mode
      partialize: (state) => ({
        theme: state.theme,
        isDebugMode: state.isDebugMode,
        flags: state.flags,
      }),
    }
  )
)

// ==========================================
// SELECTOR HOOKS
// ==========================================

/**
 * Select loading state only
 */
export const useAppLoading = () =>
  useAppStore((state) => ({
    isLoading: state.isLoading,
    loadingMessage: state.loadingMessage,
    setLoading: state.setLoading,
  }))

/**
 * Select theme state only
 */
export const useAppTheme = () =>
  useAppStore((state) => ({
    theme: state.theme,
    setTheme: state.setTheme,
  }))

/**
 * Select modal state only
 */
export const useAppModal = () =>
  useAppStore((state) => ({
    modal: state.modal,
    openModal: state.openModal,
    closeModal: state.closeModal,
  }))

/**
 * Select toast state only
 */
export const useAppToasts = () =>
  useAppStore((state) => ({
    toasts: state.toasts,
    addToast: state.addToast,
    removeToast: state.removeToast,
    clearToasts: state.clearToasts,
  }))

export default useAppStore