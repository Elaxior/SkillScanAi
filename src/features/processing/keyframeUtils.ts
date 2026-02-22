/**
 * Keyframe Detection Utilities
 * 
 * Functions for detecting important frames in athletic movements:
 * - Peak jump (highest point)
 * - Release frame (ball release in shooting)
 * - Start frame (beginning of motion)
 */

import { PoseFrame, NormalizedLandmark, LandmarkIndex } from '@/features/pose'
import {
  calculateSmoothedVelocity,
  movingAverage,
  extractCoordinateTimeSeries,
} from './smoothingUtils'
import { calculateFPS, extractHipCenterY, extractWristY } from './frameProcessor'

// ==========================================
// TYPES
// ==========================================

export interface Keyframes {
  /** Frame index of peak jump (lowest hip Y) */
  peakJump: number | null
  /** Frame index of release (basketball shot release) */
  release: number | null
  /** Frame index of motion start */
  start: number | null
  /** Frame index of motion end */
  end: number | null
}

export interface KeyframeDetectionResult {
  /** Detected keyframes */
  keyframes: Keyframes
  /** Confidence scores for each detection */
  confidence: {
    peakJump: number
    release: number
    start: number
    end: number
  }
  /** Debug information */
  debug: {
    hipYValues: number[]
    wristYVelocity: number[]
    detectionMethod: string
  }
}

export interface KeyframeConfig {
  /** Minimum frames required for detection */
  minFrames: number
  /** Velocity threshold for motion start detection */
  velocityThreshold: number
  /** Minimum confidence for landmark */
  minVisibility: number
  /** FPS for velocity calculations */
  fps: number
}

// ==========================================
// DEFAULT CONFIG
// ==========================================

const DEFAULT_KEYFRAME_CONFIG: KeyframeConfig = {
  minFrames: 15,
  velocityThreshold: 0.02,
  minVisibility: 0.5,
  fps: 30,
}

// ==========================================
// COORDINATE SYSTEM
// ==========================================

/**
 * COORDINATE SYSTEM EXPLANATION:
 * 
 * MediaPipe uses image coordinates where:
 * - Origin (0,0) is TOP-LEFT
 * - X increases to the right (0 → 1)
 * - Y increases DOWNWARD (0 → 1)
 * 
 * Therefore:
 * - Higher in frame = LOWER Y value
 * - Lower in frame = HIGHER Y value
 * 
 * For peak jump detection:
 * - We look for MINIMUM Y value (highest point in frame)
 * - This is when hips are at their highest position
 * 
 *    0,0 ─────────────────────► X
 *     │
 *     │    y=0.3  ← Higher (peak jump)
 *     │
 *     │    y=0.5  ← Middle
 *     │
 *     │    y=0.7  ← Lower (standing)
 *     │
 *     ▼
 *     Y
 */

// ==========================================
// PEAK JUMP DETECTION
// ==========================================

/**
 * Detect the frame where the person is at their highest jump point
 * 
 * Logic:
 * 1. Track vertical position (Y) of hip center
 * 2. Hip center = average of left and right hip
 * 3. Find frame with LOWEST Y value (highest in frame)
 * 4. That frame = peak jump
 * 
 * Why hip center:
 * - Most stable body reference point
 * - Not affected by arm position
 * - True measure of jump height
 */
export function detectPeakJumpFrame(
  frames: PoseFrame[],
  config: Partial<KeyframeConfig> = {}
): { frameIndex: number | null; confidence: number; hipYValues: number[] } {
  const { minFrames, minVisibility } = { ...DEFAULT_KEYFRAME_CONFIG, ...config }

  // Validate input
  if (!frames || frames.length < minFrames) {
    console.warn('[keyframeUtils] Insufficient frames for peak jump detection')
    return { frameIndex: null, confidence: 0, hipYValues: [] }
  }

  const LEFT_HIP = LandmarkIndex.LEFT_HIP
  const RIGHT_HIP = LandmarkIndex.RIGHT_HIP

  // Extract hip center Y values
  const hipYValues: number[] = []
  const validIndices: number[] = []

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i]
    const leftHip = frame.landmarks[LEFT_HIP]
    const rightHip = frame.landmarks[RIGHT_HIP]

    // Check visibility
    const leftVisible = (leftHip?.visibility ?? 0) >= minVisibility
    const rightVisible = (rightHip?.visibility ?? 0) >= minVisibility

    if (leftHip && rightHip && leftVisible && rightVisible) {
      const hipCenterY = (leftHip.y + rightHip.y) / 2
      hipYValues.push(hipCenterY)
      validIndices.push(i)
    } else {
      // Use interpolation or previous value
      hipYValues.push(hipYValues.length > 0 ? hipYValues[hipYValues.length - 1] : 0.5)
    }
  }

  if (validIndices.length === 0) {
    console.warn('[keyframeUtils] No valid hip landmarks found')
    return { frameIndex: null, confidence: 0, hipYValues }
  }

  // Apply light smoothing to reduce noise
  const smoothedHipY = movingAverage(hipYValues, 3, false)

  // Find minimum Y (highest point)
  let minY = Infinity
  let peakFrameIndex = 0

  for (let i = 0; i < smoothedHipY.length; i++) {
    if (smoothedHipY[i] < minY) {
      minY = smoothedHipY[i]
      peakFrameIndex = i
    }
  }

  // Calculate confidence based on:
  // 1. How distinct the minimum is
  // 2. Percentage of valid landmarks
  const avgY = smoothedHipY.reduce((a, b) => a + b, 0) / smoothedHipY.length
  const distinctiveness = (avgY - minY) / avgY // How much lower than average
  const landmarkRatio = validIndices.length / frames.length

  const confidence = Math.min(1, distinctiveness * 2) * landmarkRatio

  console.log('[keyframeUtils] Peak jump detected:', {
    frameIndex: peakFrameIndex,
    minY: minY.toFixed(4),
    avgY: avgY.toFixed(4),
    confidence: confidence.toFixed(3),
  })

  return {
    frameIndex: peakFrameIndex,
    confidence,
    hipYValues: smoothedHipY,
  }
}

// ==========================================
// RELEASE FRAME DETECTION (BASKETBALL)
// ==========================================

/**
 * Detect the frame where ball is released during a basketball shot
 * 
 * Heuristics (in order of reliability):
 * 1. Wrist Y velocity changes from negative (moving up) to positive (moving down)
 * 2. Maximum arm extension (elbow-wrist distance)
 * 3. Wrist reaches highest point
 * 
 * Why heuristic is sufficient for MVP:
 * - Ball is not tracked (no object detection)
 * - Release timing correlates with wrist motion
 * - Good enough for technique analysis
 * - Can be refined with more data later
 */
export function detectReleaseFrame(
  frames: PoseFrame[],
  config: Partial<KeyframeConfig> = {}
): { frameIndex: number | null; confidence: number; wristYVelocity: number[] } {
  const { minFrames, minVisibility, fps } = { ...DEFAULT_KEYFRAME_CONFIG, ...config }

  if (!frames || frames.length < minFrames) {
    console.warn('[keyframeUtils] Insufficient frames for release detection')
    return { frameIndex: null, confidence: 0, wristYVelocity: [] }
  }

  const RIGHT_WRIST = LandmarkIndex.RIGHT_WRIST
  const RIGHT_ELBOW = LandmarkIndex.RIGHT_ELBOW
  const RIGHT_SHOULDER = LandmarkIndex.RIGHT_SHOULDER

  // Extract wrist Y positions
  const wristYValues: number[] = frames.map((frame) => {
    const wrist = frame.landmarks[RIGHT_WRIST]
    return wrist?.y ?? 0
  })

  // Smooth wrist positions
  const smoothedWristY = movingAverage(wristYValues, 3, false)

  // Calculate wrist Y velocity
  const wristYVelocity = calculateSmoothedVelocity(smoothedWristY, fps, 3)

  if (wristYVelocity.length === 0) {
    return { frameIndex: null, confidence: 0, wristYVelocity: [] }
  }

  // Find release frame: where velocity changes from negative to positive
  // (wrist stops going up and starts going down)
  // Look in the upper portion of the motion (after potential jump start)
  const searchStart = Math.floor(frames.length * 0.3) // Skip first 30%
  const searchEnd = Math.floor(frames.length * 0.85) // Skip last 15%

  let releaseFrameIndex: number | null = null
  let bestScore = -Infinity

  for (let i = searchStart; i < searchEnd - 1; i++) {
    const prevVel = wristYVelocity[i - 1] ?? 0
    const currVel = wristYVelocity[i]
    const nextVel = wristYVelocity[i + 1] ?? 0

    // Look for velocity zero-crossing (negative to positive)
    // In image coords, negative velocity = moving up, positive = moving down
    if (prevVel < 0 && nextVel > 0) {
      // Check if wrist is high enough (release should be near peak)
      const wristY = smoothedWristY[i]
      const avgWristY = smoothedWristY.reduce((a, b) => a + b, 0) / smoothedWristY.length

      // Score based on how high the wrist is and how clear the direction change is
      const heightScore = (avgWristY - wristY) / avgWristY
      const velocityChangeScore = Math.abs(nextVel - prevVel)
      const score = heightScore + velocityChangeScore * 5

      if (score > bestScore) {
        bestScore = score
        releaseFrameIndex = i
      }
    }
  }

  // If no zero-crossing found, use wrist minimum Y (highest point)
  if (releaseFrameIndex === null) {
    let minWristY = Infinity
    for (let i = searchStart; i < searchEnd; i++) {
      if (smoothedWristY[i] < minWristY) {
        minWristY = smoothedWristY[i]
        releaseFrameIndex = i
      }
    }
    console.log('[keyframeUtils] Using wrist peak as release frame (no velocity crossing)')
  }

  // Calculate confidence
  const landmarkValidity = frames.filter((f) => {
    const wrist = f.landmarks[RIGHT_WRIST]
    return (wrist?.visibility ?? 0) >= minVisibility
  }).length / frames.length

  const confidence = releaseFrameIndex !== null
    ? Math.min(1, landmarkValidity * (bestScore > 0 ? 0.8 + bestScore * 0.2 : 0.5))
    : 0

  console.log('[keyframeUtils] Release frame detected:', {
    frameIndex: releaseFrameIndex,
    confidence: confidence.toFixed(3),
    method: bestScore > 0 ? 'velocity-crossing' : 'wrist-peak',
  })

  return {
    frameIndex: releaseFrameIndex,
    confidence,
    wristYVelocity,
  }
}

// ==========================================
// START FRAME DETECTION
// ==========================================

/**
 * Detect the frame where the motion/action begins
 * 
 * Logic:
 * 1. Track vertical velocity of hip center
 * 2. Find first frame where velocity exceeds threshold
 * 3. Or find where knee angle starts changing significantly
 * 
 * For basketball:
 * - Start = beginning of squat/load phase
 * - Knees bend, hips drop slightly before jump
 */
export function detectStartFrame(
  frames: PoseFrame[],
  config: Partial<KeyframeConfig> = {}
): { frameIndex: number | null; confidence: number } {
  const { minFrames, velocityThreshold, fps } = { ...DEFAULT_KEYFRAME_CONFIG, ...config }

  if (!frames || frames.length < minFrames) {
    console.warn('[keyframeUtils] Insufficient frames for start detection')
    return { frameIndex: null, confidence: 0 }
  }

  // Extract hip center Y
  const hipYValues = extractHipCenterY(frames)
  const smoothedHipY = movingAverage(hipYValues, 3, false)

  // Calculate hip velocity
  const hipVelocity = calculateSmoothedVelocity(smoothedHipY, fps, 3)

  if (hipVelocity.length === 0) {
    return { frameIndex: null, confidence: 0 }
  }

  // Find first significant downward motion (positive velocity = moving down = squatting)
  // Then find first significant upward motion (negative velocity = jumping up)
  let startFrameIndex: number | null = null
  const searchEnd = Math.floor(frames.length * 0.5) // Only look in first half

  // Look for first significant velocity change
  for (let i = 2; i < searchEnd; i++) {
    const avgVelBefore = (hipVelocity[i - 2] + hipVelocity[i - 1]) / 2
    const currVel = hipVelocity[i]

    // Detect start of motion: velocity magnitude increases significantly
    if (Math.abs(currVel - avgVelBefore) > velocityThreshold) {
      startFrameIndex = i
      break
    }
  }

  // Fallback: find first frame with above-average velocity
  if (startFrameIndex === null) {
    const avgVel = hipVelocity.slice(0, searchEnd)
      .reduce((a, b) => a + Math.abs(b), 0) / searchEnd

    for (let i = 0; i < searchEnd; i++) {
      if (Math.abs(hipVelocity[i]) > avgVel * 1.5) {
        startFrameIndex = Math.max(0, i - 2) // Slightly before detected motion
        break
      }
    }
  }

  // Still no start found - use first frame
  if (startFrameIndex === null) {
    startFrameIndex = 0
    console.log('[keyframeUtils] No clear start detected, using first frame')
  }

  // Calculate confidence
  const confidence = startFrameIndex !== null && startFrameIndex > 0 ? 0.7 : 0.3

  console.log('[keyframeUtils] Start frame detected:', {
    frameIndex: startFrameIndex,
    confidence: confidence.toFixed(3),
  })

  return {
    frameIndex: startFrameIndex,
    confidence,
  }
}

// ==========================================
// END FRAME DETECTION
// ==========================================

/**
 * Detect the frame where the motion ends (follow-through)
 */
export function detectEndFrame(
  frames: PoseFrame[],
  peakJumpFrame: number | null,
  config: Partial<KeyframeConfig> = {}
): { frameIndex: number | null; confidence: number } {
  const { fps, velocityThreshold } = { ...DEFAULT_KEYFRAME_CONFIG, ...config }

  if (!frames || frames.length < 10) {
    return { frameIndex: null, confidence: 0 }
  }

  // Extract hip Y and calculate velocity
  const hipYValues = extractHipCenterY(frames)
  const smoothedHipY = movingAverage(hipYValues, 3, false)
  const hipVelocity = calculateSmoothedVelocity(smoothedHipY, fps, 3)

  // Start searching after peak jump
  const searchStart = peakJumpFrame ?? Math.floor(frames.length * 0.5)
  const searchEnd = frames.length - 2

  let endFrameIndex: number | null = null

  // Find where velocity settles (landing/standing still)
  for (let i = searchStart + 5; i < searchEnd; i++) {
    const recentVelocities = hipVelocity.slice(Math.max(searchStart, i - 5), i + 1)
    const avgRecentVel = recentVelocities.reduce((a, b) => a + Math.abs(b), 0) / recentVelocities.length

    if (avgRecentVel < velocityThreshold) {
      endFrameIndex = i
      break
    }
  }

  // Fallback: use last frame
  if (endFrameIndex === null) {
    endFrameIndex = frames.length - 1
  }

  const confidence = endFrameIndex < frames.length - 1 ? 0.7 : 0.4

  console.log('[keyframeUtils] End frame detected:', {
    frameIndex: endFrameIndex,
    confidence: confidence.toFixed(3),
  })

  return {
    frameIndex: endFrameIndex,
    confidence,
  }
}

// ==========================================
// MAIN DETECTION FUNCTION
// ==========================================

/**
 * Detect all keyframes for an athletic movement
 */
export function detectKeyframes(
  frames: PoseFrame[],
  videoDuration: number,
  config: Partial<KeyframeConfig> = {}
): KeyframeDetectionResult {
  const fps = frames.length / videoDuration
  const fullConfig = { ...DEFAULT_KEYFRAME_CONFIG, ...config, fps }

  console.log('[keyframeUtils] Starting keyframe detection:', {
    frameCount: frames.length,
    duration: videoDuration,
    fps,
  })

  // Detect each keyframe
  const peakResult = detectPeakJumpFrame(frames, fullConfig)
  const releaseResult = detectReleaseFrame(frames, fullConfig)
  const startResult = detectStartFrame(frames, fullConfig)
  const endResult = detectEndFrame(frames, peakResult.frameIndex, fullConfig)

  const result: KeyframeDetectionResult = {
    keyframes: {
      peakJump: peakResult.frameIndex,
      release: releaseResult.frameIndex,
      start: startResult.frameIndex,
      end: endResult.frameIndex,
    },
    confidence: {
      peakJump: peakResult.confidence,
      release: releaseResult.confidence,
      start: startResult.confidence,
      end: endResult.confidence,
    },
    debug: {
      hipYValues: peakResult.hipYValues,
      wristYVelocity: releaseResult.wristYVelocity,
      detectionMethod: 'velocity-based',
    },
  }

  console.log('[keyframeUtils] Keyframe detection complete:', result.keyframes)

  return result
}

// ==========================================
// VALIDATION
// ==========================================

/**
 * Validate detected keyframes for logical consistency
 */
export function validateKeyframes(keyframes: Keyframes): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check order: start < peakJump < release < end (approximately)
  if (keyframes.start !== null && keyframes.peakJump !== null) {
    if (keyframes.start > keyframes.peakJump) {
      issues.push('Start frame detected after peak jump')
    }
  }

  if (keyframes.peakJump !== null && keyframes.end !== null) {
    if (keyframes.peakJump > keyframes.end) {
      issues.push('Peak jump detected after end frame')
    }
  }

  // Release should be near peak jump
  if (keyframes.release !== null && keyframes.peakJump !== null) {
    const releasePeakDiff = Math.abs(keyframes.release - keyframes.peakJump)
    if (releasePeakDiff > 15) {
      // More than 0.5s at 30fps
      issues.push('Release frame far from peak jump (unusual for basketball shot)')
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}

// ==========================================
// EXPORTS
// ==========================================

export {
  DEFAULT_KEYFRAME_CONFIG,
}