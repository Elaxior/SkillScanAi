/**
 * Session Store - Zustand
 * 
 * Manages the current analysis session state including pose data and keyframes.
 */

import { create } from 'zustand'
import {
  Session,
  SessionStatus,
  DEFAULT_SESSION,
  generateSessionId,
  Sport,
} from '@/types'
import type { PoseFrame, PoseDetectionResult } from '@/features/pose'
import type { Keyframes, ProcessedFrameData } from '@/features/processing'
import { Metrics, Flaw } from '@/types'

// ==========================================
// KEYFRAMES TYPE
// ==========================================

export interface SessionKeyframes {
  peakJump: number | null
  release: number | null
  start: number | null
  end: number | null
}

// ==========================================
// STORE STATE TYPE
// ==========================================

interface SessionState extends Omit<Session, 'landmarks'> {
  // Scoring
  scoreBreakdown: Record<string, number>
  scoreConfidence: number

  // Pose data
  landmarks: PoseFrame[]
  smoothedLandmarks: PoseFrame[]
  poseResult: PoseDetectionResult | null

  // Processing data
  processedData: ProcessedFrameData | null
  keyframes: SessionKeyframes
  fps: number | null

  // Computed helpers
  hasVideo: boolean
  isRecording: boolean
  isAnalyzing: boolean
  isComplete: boolean
  hasError: boolean
  hasPoseData: boolean
  hasKeyframes: boolean
}

interface SessionActions {
  // Session lifecycle
  startNewSession: (sport: Sport, actionId: string) => void
  resetSession: () => void

  // Recording
  startRecording: () => void
  stopRecording: () => void

  // Video
  setVideo: (url: string, metadata?: {
    duration?: number
    fps?: number
    width?: number
    height?: number
  }) => void
  clearVideo: () => void

  // Pose data
  setLandmarks: (frames: PoseFrame[]) => void
  setPoseResult: (result: PoseDetectionResult) => void
  clearPoseData: () => void

  // Processing data
  setProcessedData: (data: ProcessedFrameData) => void
  setSmoothedLandmarks: (frames: PoseFrame[]) => void
  setKeyframes: (keyframes: SessionKeyframes) => void
  setFps: (fps: number) => void
  clearProcessingData: () => void

  // Analysis results
  setMetrics: (metrics: Metrics) => void
  setScore: (score: number) => void
  setFlaws: (flaws: Flaw[]) => void
  setScoreBreakdown: (breakdown: Record<string, number>) => void
  setScoreWithDetails: (score: number | null, breakdown: Record<string, number>, confidence: number) => void
  clearScoring: () => void

  // Status management
  setStatus: (status: SessionStatus) => void
  setError: (error: string | null) => void

  // Bulk update
  setAnalysisResults: (results: {
    landmarks?: PoseFrame[]
    metrics: Metrics
    score: number
    flaws: Flaw[]
  }) => void
}

type SessionStore = SessionState & SessionActions

// ==========================================
// INITIAL STATE
// ==========================================

const initialKeyframes: SessionKeyframes = {
  peakJump: null,
  release: null,
  start: null,
  end: null,
}

const initialState: SessionState = {
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
  smoothedLandmarks: [],
  poseResult: null,
  processedData: null,
  keyframes: initialKeyframes,
  fps: null,
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
  scoreBreakdown: {},
  scoreConfidence: 0,

  // Computed
  hasVideo: false,
  isRecording: false,
  isAnalyzing: false,
  isComplete: false,
  hasError: false,
  hasPoseData: false,
  hasKeyframes: false,
}

// ==========================================
// STORE IMPLEMENTATION
// ==========================================

export const useSessionStore = create<SessionStore>()((set, get) => ({
  ...initialState,

  // ==========================================
  // SESSION LIFECYCLE
  // ==========================================

  startNewSession: (sport, actionId) => {
    const currentUrl = get().video.url
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl)
    }

    set({
      ...initialState,
      id: generateSessionId(),
      sport,
      actionId,
      status: SessionStatus.IDLE,
      timestamps: {
        ...initialState.timestamps,
        createdAt: Date.now(),
      },
    })
  },

  resetSession: () => {
    const currentUrl = get().video.url
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl)
    }

    set(initialState)
  },

  // ==========================================
  // RECORDING
  // ==========================================

  startRecording: () => {
    set((state) => ({
      status: SessionStatus.RECORDING,
      isRecording: true,
      timestamps: {
        ...state.timestamps,
        recordingStartedAt: Date.now(),
      },
    }))
  },

  stopRecording: () => {
    set((state) => ({
      status: SessionStatus.PROCESSING,
      isRecording: false,
      timestamps: {
        ...state.timestamps,
        recordingEndedAt: Date.now(),
      },
    }))
  },

  // ==========================================
  // VIDEO
  // ==========================================

  setVideo: (url, metadata = {}) => {
    const currentUrl = get().video.url
    if (currentUrl && currentUrl !== url) {
      URL.revokeObjectURL(currentUrl)
    }

    set((state) => ({
      video: {
        url,
        duration: metadata.duration ?? state.video.duration,
        fps: metadata.fps ?? state.video.fps,
        width: metadata.width ?? state.video.width,
        height: metadata.height ?? state.video.height,
      },
      hasVideo: true,
      status: SessionStatus.PROCESSING,
    }))
  },

  clearVideo: () => {
    const currentUrl = get().video.url
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl)
    }

    set({
      video: {
        url: null,
        duration: null,
        fps: null,
        width: null,
        height: null,
      },
      hasVideo: false,
    })
  },

  // ==========================================
  // POSE DATA
  // ==========================================

  setLandmarks: (frames) => {
    console.log('[SessionStore] Setting landmarks:', frames.length, 'frames')
    set({
      landmarks: frames,
      hasPoseData: frames.length > 0,
    })
  },

  setPoseResult: (result) => {
    console.log('[SessionStore] Setting pose result:', {
      totalFrames: result.totalFrames,
      framesWithPose: result.framesWithPose,
      detectionRate: `${(result.detectionRate * 100).toFixed(1)}%`,
    })
    set({
      poseResult: result,
      landmarks: result.frames,
      hasPoseData: result.frames.length > 0,
    })
  },

  clearPoseData: () => {
    set({
      landmarks: [],
      smoothedLandmarks: [],
      poseResult: null,
      hasPoseData: false,
    })
  },

  // ==========================================
  // PROCESSING DATA
  // ==========================================

  setProcessedData: (data) => {
    console.log('[SessionStore] Setting processed data:', {
      fps: data.fps,
      frameCount: data.frameCount,
      smoothingApplied: data.metadata.smoothingApplied,
    })
    set({
      processedData: data,
      smoothedLandmarks: data.smoothedFrames,
      fps: data.fps,
    })
  },

  setSmoothedLandmarks: (frames) => {
    console.log('[SessionStore] Setting smoothed landmarks:', frames.length, 'frames')
    set({
      smoothedLandmarks: frames,
    })
  },

  setKeyframes: (keyframes) => {
    console.log('[SessionStore] Setting keyframes:', keyframes)
    set({
      keyframes,
      hasKeyframes:
        keyframes.peakJump !== null ||
        keyframes.release !== null ||
        keyframes.start !== null ||
        keyframes.end !== null,
    })
  },

  setFps: (fps) => {
    console.log('[SessionStore] Setting FPS:', fps)
    set({ fps })
  },

  clearProcessingData: () => {
    set({
      processedData: null,
      smoothedLandmarks: [],
      keyframes: initialKeyframes,
      fps: null,
      hasKeyframes: false,
    })
  },

  // ==========================================
  // ANALYSIS RESULTS
  // ==========================================

  setMetrics: (metrics) => {
    set({ metrics })
    console.log('[SessionStore] Metrics updated:', metrics)
  },

  setScore: (score) => {
    set({ score })
  },

  setFlaws: (flaws) => {
    set({ flaws })
  },

  setScoreBreakdown: (breakdown) => {
    set({ scoreBreakdown: breakdown })
    console.log('[SessionStore] Score breakdown set:', breakdown)
  },

  setScoreWithDetails: (score, breakdown, confidence) => {
    set({
      score,
      scoreBreakdown: breakdown,
      scoreConfidence: confidence,
    })
    console.log('[SessionStore] Full score details set:', { score, breakdown, confidence })
  },

  clearScoring: () => {
    set({
      score: null,
      scoreBreakdown: {},
      scoreConfidence: 0,
    })
    console.log('[SessionStore] Scoring cleared')
  },

  setAnalysisResults: (results) => {
    set((state) => ({
      landmarks: results.landmarks ?? state.landmarks,
      metrics: results.metrics,
      score: results.score,
      flaws: results.flaws,
      status: SessionStatus.COMPLETE,
      isAnalyzing: false,
      isComplete: true,
      timestamps: {
        ...state.timestamps,
        analyzedAt: Date.now(),
      },
    }))
  },

  // ==========================================
  // STATUS MANAGEMENT
  // ==========================================

  setStatus: (status) => {
    set({
      status,
      isRecording: status === SessionStatus.RECORDING,
      isAnalyzing: status === SessionStatus.ANALYZING,
      isComplete: status === SessionStatus.COMPLETE,
      hasError: status === SessionStatus.ERROR,
    })
  },

  setError: (error) => {
    set({
      error,
      status: error ? SessionStatus.ERROR : get().status,
      hasError: error !== null,
    })
  },
}))

// ==========================================
// SELECTOR HOOKS
// ==========================================

export const useSessionVideo = () =>
  useSessionStore((state) => ({
    video: state.video,
    hasVideo: state.hasVideo,
    setVideo: state.setVideo,
    clearVideo: state.clearVideo,
  }))

export const useSessionPose = () =>
  useSessionStore((state) => ({
    landmarks: state.landmarks,
    smoothedLandmarks: state.smoothedLandmarks,
    poseResult: state.poseResult,
    hasPoseData: state.hasPoseData,
    setLandmarks: state.setLandmarks,
    setPoseResult: state.setPoseResult,
    clearPoseData: state.clearPoseData,
  }))

export const useSessionProcessing = () =>
  useSessionStore((state) => ({
    processedData: state.processedData,
    smoothedLandmarks: state.smoothedLandmarks,
    keyframes: state.keyframes,
    fps: state.fps,
    hasKeyframes: state.hasKeyframes,
    setProcessedData: state.setProcessedData,
    setKeyframes: state.setKeyframes,
    setFps: state.setFps,
    clearProcessingData: state.clearProcessingData,
  }))

export const useSessionResults = () =>
  useSessionStore((state) => ({
    landmarks: state.landmarks,
    poseResult: state.poseResult,
    metrics: state.metrics,
    score: state.score,
    flaws: state.flaws,
    isComplete: state.isComplete,
  }))

export default useSessionStore

