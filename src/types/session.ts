/**
 * Session Types for SkillScan AI
 * 
 * A session represents a single recording/analysis cycle.
 * This type structure prepares for AI output data.
 */

import { Sport } from './sport'
import { Metrics, Flaw, Landmark } from './metrics'
import type { PoseFrame, PoseDetectionResult } from '@/features/pose/types'

// ==========================================
// SESSION STATUS
// ==========================================

/**
 * Current state of an analysis session
 */
export enum SessionStatus {
  /** No active session */
  IDLE = 'idle',
  /** Recording in progress */
  RECORDING = 'recording',
  /** Processing video */
  PROCESSING = 'processing',
  /** AI analysis in progress */
  ANALYZING = 'analyzing',
  /** Analysis complete */
  COMPLETE = 'complete',
  /** An error occurred */
  ERROR = 'error',
}

// ==========================================
// SESSION STATE
// ==========================================

/**
 * Complete session state structure
 */
export interface Session {
  /** Unique session identifier */
  id: string
  
  /** Current session status */
  status: SessionStatus
  
  /** Video data */
  video: {
    /** Blob URL for playback */
    url: string | null
    /** Video duration in seconds */
    duration: number | null
    /** Frame rate */
    fps: number | null
    /** Video dimensions */
    width: number | null
    height: number | null
  }
  
  /** Sport being analyzed */
  sport: Sport | null
  
  /** Specific action being analyzed */
  actionId: string | null
  
  /** Pose landmarks from AI detection - now properly typed */
  landmarks: PoseFrame[]
  
  /** Pose detection result summary */
  poseResult: PoseDetectionResult | null
  
  /** Calculated performance metrics */
  metrics: Metrics
  
  /** Overall performance score (0-100) */
  score: number | null
  
  /** Detected technique flaws */
  flaws: Flaw[]
  
  /** Session timestamps */
  timestamps: {
    /** When session was created */
    createdAt: number | null
    /** When recording started */
    recordingStartedAt: number | null
    /** When recording ended */
    recordingEndedAt: number | null
    /** When analysis completed */
    analyzedAt: number | null
  }
  
  /** Any error that occurred */
  error: string | null
}

// ==========================================
// SESSION DEFAULTS
// ==========================================

/**
 * Default/initial session state
 */
export const DEFAULT_SESSION: Session = {
  id: '',
  status: SessionStatus.IDLE,
  video: {
    url: null,
    duration: null,
    fps: null,
    width: null,
    height: null,
  },
  sport: null,
  actionId: null,
  landmarks: [],
  poseResult: null,
  metrics: {},
  score: null,
  flaws: [],
  timestamps: {
    createdAt: null,
    recordingStartedAt: null,
    recordingEndedAt: null,
    analyzedAt: null,
  },
  error: null,
}

// ==========================================
// SESSION HELPERS
// ==========================================

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if session has video
 */
export function hasVideo(session: Session): boolean {
  return session.video.url !== null
}

/**
 * Check if session is complete
 */
export function isSessionComplete(session: Session): boolean {
  return session.status === SessionStatus.COMPLETE && session.score !== null
}

/**
 * Check if session is in progress
 */
export function isSessionInProgress(session: Session): boolean {
  return [
    SessionStatus.RECORDING,
    SessionStatus.PROCESSING,
    SessionStatus.ANALYZING,
  ].includes(session.status)
}

/**
 * Get session duration (recording time)
 */
export function getSessionDuration(session: Session): number | null {
  const { recordingStartedAt, recordingEndedAt } = session.timestamps
  if (recordingStartedAt && recordingEndedAt) {
    return (recordingEndedAt - recordingStartedAt) / 1000
  }
  return null
}