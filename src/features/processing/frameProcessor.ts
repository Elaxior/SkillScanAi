/**
 * Frame Processor
 * 
 * Main processing pipeline for pose landmark data.
 * Handles smoothing, FPS calculation, and data validation.
 */

import { PoseFrame, NormalizedLandmark } from '@/features/pose'
import {
  smoothLandmarkFrames,
  SmoothingConfig,
  calculateSmoothedVelocity,
} from './smoothingUtils'

// ==========================================
// TYPES
// ==========================================

export interface ProcessedFrameData {
  /** Smoothed landmark frames */
  smoothedFrames: PoseFrame[]
  /** Original frames (unmodified) */
  originalFrames: PoseFrame[]
  /** Calculated frames per second */
  fps: number
  /** Total video duration */
  duration: number
  /** Total frame count */
  frameCount: number
  /** Frames with valid pose */
  validFrameCount: number
  /** Average confidence across all frames */
  averageConfidence: number
  /** Processing metadata */
  metadata: ProcessingMetadata
}

export interface ProcessingMetadata {
  /** Timestamp when processing started */
  processedAt: number
  /** Time taken to process (ms) */
  processingTime: number
  /** Smoothing window used */
  smoothingWindow: number
  /** Whether smoothing was applied */
  smoothingApplied: boolean
}

export interface ProcessingConfig {
  /** Whether to apply smoothing */
  enableSmoothing: boolean
  /** Smoothing configuration */
  smoothingConfig: Partial<SmoothingConfig>
  /** Minimum frames required for processing */
  minFrames: number
  /** Minimum confidence for valid frame */
  minConfidence: number
}

// ==========================================
// DEFAULT CONFIG
// ==========================================

const DEFAULT_PROCESSING_CONFIG: ProcessingConfig = {
  enableSmoothing: true,
  smoothingConfig: {
    windowSize: 5,
    preserveEdges: true,
    minVisibility: 0.3,
    smoothVisibility: false,
  },
  minFrames: 10,
  minConfidence: 0.3,
}

// ==========================================
// VALIDATION
// ==========================================

/**
 * Validate that frames have sufficient data for processing
 */
export function validateFrames(
  frames: PoseFrame[],
  config: ProcessingConfig = DEFAULT_PROCESSING_CONFIG
): { isValid: boolean; issues: string[] } {
  const issues: string[] = []

  // Check frame count
  if (!frames || frames.length === 0) {
    issues.push('No frames provided')
    return { isValid: false, issues }
  }

  if (frames.length < config.minFrames) {
    issues.push(`Insufficient frames: ${frames.length} < ${config.minFrames} required`)
  }

  // Check for landmarks in frames
  const framesWithLandmarks = frames.filter(
    (f) => f.landmarks && f.landmarks.length > 0
  )

  if (framesWithLandmarks.length === 0) {
    issues.push('No frames contain landmarks')
    return { isValid: false, issues }
  }

  const landmarkRatio = framesWithLandmarks.length / frames.length
  if (landmarkRatio < 0.5) {
    issues.push(`Low landmark detection rate: ${(landmarkRatio * 100).toFixed(1)}%`)
  }

  // Check average confidence
  const avgConfidence =
    frames.reduce((sum, f) => sum + f.confidence, 0) / frames.length
  if (avgConfidence < config.minConfidence) {
    issues.push(`Low average confidence: ${(avgConfidence * 100).toFixed(1)}%`)
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}

// ==========================================
// FPS CALCULATION
// ==========================================

/**
 * Calculate frames per second from frame data and video duration
 * 
 * Why estimated FPS is necessary:
 * 1. Video FPS may not match processing FPS
 * 2. Frames may be dropped during processing
 * 3. Time-based metrics need accurate FPS
 * 4. Velocity calculations require dt = 1/fps
 */
export function calculateFPS(
  frames: PoseFrame[],
  videoDuration: number
): number {
  if (frames.length === 0 || videoDuration <= 0) {
    console.warn('[frameProcessor] Cannot calculate FPS: invalid input')
    return 30 // Default fallback
  }

  const fps = frames.length / videoDuration

  // Sanity check - FPS should be reasonable
  if (fps < 10 || fps > 120) {
    console.warn('[frameProcessor] Unusual FPS calculated:', fps)
  }

  return fps
}

/**
 * Calculate FPS from frame timestamps
 */
export function calculateFPSFromTimestamps(frames: PoseFrame[]): number {
  if (frames.length < 2) return 30

  // Calculate average time between frames
  let totalDelta = 0
  let count = 0

  for (let i = 1; i < frames.length; i++) {
    const delta = frames[i].timestamp - frames[i - 1].timestamp
    if (delta > 0 && delta < 1) {
      // Valid delta (less than 1 second between frames)
      totalDelta += delta
      count++
    }
  }

  if (count === 0) return 30

  const avgDelta = totalDelta / count
  const fps = 1 / avgDelta

  return Math.round(fps * 100) / 100 // Round to 2 decimal places
}

// ==========================================
// MAIN PROCESSOR
// ==========================================

/**
 * Main frame processing function
 * 
 * Pipeline:
 * 1. Validate input data
 * 2. Calculate FPS
 * 3. Apply smoothing (if enabled)
 * 4. Calculate statistics
 * 5. Return processed data
 */
export function processLandmarkFrames(
  frames: PoseFrame[],
  videoDuration: number,
  config: Partial<ProcessingConfig> = {}
): ProcessedFrameData | null {
  const startTime = Date.now()
  const fullConfig = { ...DEFAULT_PROCESSING_CONFIG, ...config }

  console.log('[frameProcessor] Starting frame processing:', {
    frameCount: frames.length,
    duration: videoDuration,
    config: fullConfig,
  })

  // Validate input
  const validation = validateFrames(frames, fullConfig)
  if (!validation.isValid) {
    console.error('[frameProcessor] Validation failed:', validation.issues)
    return null
  }

  if (validation.issues.length > 0) {
    console.warn('[frameProcessor] Validation warnings:', validation.issues)
  }

  // Calculate FPS
  const fps = calculateFPS(frames, videoDuration)
  console.log('[frameProcessor] Calculated FPS:', fps)

  // Apply smoothing
  let smoothedFrames: PoseFrame[]
  let smoothingApplied = false

  if (fullConfig.enableSmoothing && frames.length >= (fullConfig.smoothingConfig.windowSize ?? 5)) {
    smoothedFrames = smoothLandmarkFrames(frames, fullConfig.smoothingConfig)
    smoothingApplied = true
    console.log('[frameProcessor] Smoothing applied')
  } else {
    // Create copies without smoothing
    smoothedFrames = frames.map((f) => ({
      ...f,
      landmarks: [...f.landmarks],
    }))
    console.log('[frameProcessor] Smoothing skipped (insufficient frames or disabled)')
  }

  // Calculate statistics
  const validFrameCount = frames.filter(
    (f) => f.confidence >= fullConfig.minConfidence && f.landmarks.length > 0
  ).length

  const averageConfidence =
    frames.reduce((sum, f) => sum + f.confidence, 0) / frames.length

  // Build result
  const processingTime = Date.now() - startTime

  const result: ProcessedFrameData = {
    smoothedFrames,
    originalFrames: frames,
    fps,
    duration: videoDuration,
    frameCount: frames.length,
    validFrameCount,
    averageConfidence,
    metadata: {
      processedAt: Date.now(),
      processingTime,
      smoothingWindow: fullConfig.smoothingConfig.windowSize ?? 5,
      smoothingApplied,
    },
  }

  console.log('[frameProcessor] Processing complete:', {
    fps: result.fps,
    frameCount: result.frameCount,
    validFrameCount: result.validFrameCount,
    averageConfidence: `${(result.averageConfidence * 100).toFixed(1)}%`,
    processingTime: `${result.metadata.processingTime}ms`,
  })

  return result
}

// ==========================================
// COORDINATE EXTRACTION HELPERS
// ==========================================

/**
 * Extract Y coordinates for hip center across all frames
 * Hip center = average of left and right hip
 */
export function extractHipCenterY(frames: PoseFrame[]): number[] {
  const LEFT_HIP = 23
  const RIGHT_HIP = 24

  return frames.map((frame) => {
    const leftHip = frame.landmarks[LEFT_HIP]
    const rightHip = frame.landmarks[RIGHT_HIP]

    if (!leftHip || !rightHip) return 0

    // Average Y position of both hips
    return (leftHip.y + rightHip.y) / 2
  })
}

/**
 * Extract wrist Y coordinates
 */
export function extractWristY(
  frames: PoseFrame[],
  hand: 'left' | 'right' = 'right'
): number[] {
  const WRIST_INDEX = hand === 'left' ? 15 : 16

  return frames.map((frame) => {
    const wrist = frame.landmarks[WRIST_INDEX]
    return wrist?.y ?? 0
  })
}

/**
 * Extract shoulder Y coordinates
 */
export function extractShoulderY(
  frames: PoseFrame[],
  side: 'left' | 'right' = 'right'
): number[] {
  const SHOULDER_INDEX = side === 'left' ? 11 : 12

  return frames.map((frame) => {
    const shoulder = frame.landmarks[SHOULDER_INDEX]
    return shoulder?.y ?? 0
  })
}

// ==========================================
// EXPORTS
// ==========================================

export {
  DEFAULT_PROCESSING_CONFIG,
}