/**
 * Store Index - Central Export
 * 
 * Import all stores from this single file:
 * import { useUserStore, useSessionStore, useAppStore } from '@/store'
 */

// Main stores
export { useUserStore, useUserHeight, useUserSport, useUserPreferences } from './useUserStore'
export { useSessionStore, useSessionVideo, useSessionPose, useSessionProcessing, useSessionResults } from './useSessionStore'
export { useAppStore, useAppLoading, useAppTheme, useAppModal, useAppToasts } from './useAppStore'