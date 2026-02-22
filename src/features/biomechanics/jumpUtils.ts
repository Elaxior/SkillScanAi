/**
 * Jump Height and Analysis Utilities
 * 
 * Functions for analyzing jump performance including:
 * - Jump height estimation
 * - Takeoff/landing detection
 * - Flight time calculation
 * 
 * WHY HIP CENTER (not ankles):
 * - Ankle position changes with foot articulation
 * - Hip center is more stable reference point
 * - Represents true body center of mass better
 * - Less affected by camera angle
 */

import { NormalizedPoint } from './vectorUtils'
import { calculateVerticalDistancePhysics, DistanceResult } from './distanceUtils'
import { calculateVerticalVelocityPhysics } from './velocityUtils'
import { PoseFrame, LandmarkIndex } from '@/features/pose'

// ==========================================
// TYPES
// ==========================================

/**
 * Jump analysis result
 */
export interface JumpAnalysis {
  /** Jump height in normalized units */
  heightNormalized: number
  /** Jump height as percentage of body height (approximate) */
  heightPercentage: number
  /** Frame index of takeoff */
  takeoffFrame: number | null
  /** Frame index of peak jump */
  peakFrame: number | null
  /** Frame index of landing */
  landingFrame: number | null
  /** Flight time in seconds */
  flightTime: number | null
  /** Maximum upward velocity */
  peakVelocity: number
  /** Confidence in the measurement */
  confidence: number
  /** Whether the analysis is valid */
  isValid: boolean
}

/**
 * Hip center tracking result
 */
export interface HipCenterResult {
  /** Hip center position */
  position: NormalizedPoint
  /** Whether the position is valid */
  isValid: boolean
  /** Confidence */
  confidence: number
}

// ==========================================
// CONSTANTS
// ==========================================

const MIN_VISIBILITY = 0.5
const MIN_JUMP_HEIGHT = 0.01 // Minimum detectable jump (1% of frame height)

// ==========================================
// HIP CENTER CALCULATION
// ==========================================

/**
 * Calculate hip center position from left and right hip landmarks
 */
export function calculateHipCenter(
  leftHip: NormalizedPoint | undefined,
  rightHip: NormalizedPoint | undefined
): HipCenterResult {
  if (!leftHip || !rightHip) {
    return {
      position: { x: 0, y: 0 },
      isValid: false,
      confidence: 0,
    }
  }

  const visLeft = leftHip.visibility ?? 0
  const visRight = rightHip.visibility ?? 0
  const confidence = Math.min(visLeft, visRight)

  if (visLeft < MIN_VISIBILITY || visRight < MIN_VISIBILITY) {
    return {
      position: { x: 0, y: 0 },
      isValid: false,
      confidence,
    }
  }

  const position: NormalizedPoint = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
    z: ((leftHip.z ?? 0) + (rightHip.z ?? 0)) / 2,
    visibility: confidence,
  }

  return {
    position,
    isValid: true,
    confidence,
  }
}

/**
 * Get hip center from a pose frame
 */
export function getHipCenterFromFrame(frame: PoseFrame): HipCenterResult {
  const leftHip = frame.landmarks[LandmarkIndex.LEFT_HIP]
  const rightHip = frame.landmarks[LandmarkIndex.RIGHT_HIP]
  return calculateHipCenter(leftHip, rightHip)
}

// ==========================================
// JUMP HEIGHT ESTIMATION
// ==========================================

/**
 * Estimate jump height from baseline and peak frames
 * 
 * ALGORITHM:
 * 1. Calculate hip center Y at baseline (standing)
 * 2. Calculate hip center Y at peak (highest point)
 * 3. Jump height = baseline Y - peak Y (inverted for physics)
 * 
 * @param frames - All pose frames
 * @param peakFrame - Frame index of peak jump
 * @param baselineFrame - Frame index of baseline (standing)
 * @returns Jump height in normalized units
 */
export function estimateJumpHeight(
  frames: PoseFrame[],
  peakFrame: number | null,
  baselineFrame: number | null
): {
  heightNormalized: number
  heightPercentage: number
  confidence: number
  isValid: boolean
} {
  // Validate inputs
  if (!frames || frames.length === 0) {
    return {
      heightNormalized: 0,
      heightPercentage: 0,
      confidence: 0,
      isValid: false,
    }
  }

  // Use provided frames or estimate them
  const actualBaselineFrame = baselineFrame ?? 0
  const actualPeakFrame = peakFrame ?? findPeakJumpFrame(frames)

  if (actualPeakFrame === null || 
      actualBaselineFrame < 0 || 
      actualPeakFrame < 0 ||
      actualBaselineFrame >= frames.length ||
      actualPeakFrame >= frames.length) {
    return {
      heightNormalized: 0,
      heightPercentage: 0,
      confidence: 0,
      isValid: false,
    }
  }

  // Get hip centers at baseline and peak
  const baselineHip = getHipCenterFromFrame(frames[actualBaselineFrame])
  const peakHip = getHipCenterFromFrame(frames[actualPeakFrame])

  if (!baselineHip.isValid || !peakHip.isValid) {
    return {
      heightNormalized: 0,
      heightPercentage: 0,
      confidence: Math.min(baselineHip.confidence, peakHip.confidence),
      isValid: false,
    }
  }

  // Calculate vertical distance (in physics coordinates, positive = upward)
  // In MediaPipe coords: lower Y = higher in frame
  // So jump height = baselineY - peakY
  const heightNormalized = baselineHip.position.y - peakHip.position.y

  // Check if this is a valid jump
  if (heightNormalized < MIN_JUMP_HEIGHT) {
    return {
      heightNormalized: 0,
      heightPercentage: 0,
      confidence: Math.min(baselineHip.confidence, peakHip.confidence),
      isValid: false,
    }
  }

  // Estimate height as percentage of approximate body height
  // Body height ≈ 0.85-0.95 of frame height for typical camera setup
  // This is a rough approximation
  const estimatedBodyHeight = 0.6 // Conservative estimate
  const heightPercentage = (heightNormalized / estimatedBodyHeight) * 100

  return {
    heightNormalized,
    heightPercentage: Math.min(100, heightPercentage), // Cap at 100%
    confidence: Math.min(baselineHip.confidence, peakHip.confidence),
    isValid: true,
  }
}

// ==========================================
// PEAK JUMP DETECTION
// ==========================================

/**
 * Find the frame with the highest jump (lowest hip Y in MediaPipe coords)
 */
export function findPeakJumpFrame(frames: PoseFrame[]): number | null {
  if (!frames || frames.length === 0) {
    return null
  }

  let minY = Infinity
  let peakFrame: number | null = null

  for (let i = 0; i < frames.length; i++) {
    const hipCenter = getHipCenterFromFrame(frames[i])
    
    if (hipCenter.isValid && hipCenter.position.y < minY) {
      minY = hipCenter.position.y
      peakFrame = i
    }
  }

  return peakFrame
}

/**
 * Find baseline frame (standing position before jump)
 * Looks for stable hip position in first portion of frames
 */
export function findBaselineFrame(frames: PoseFrame[]): number | null {
  if (!frames || frames.length < 5) {
    return null
  }

  // Look in first 20% of frames for most stable/lowest position
  const searchEnd = Math.min(Math.floor(frames.length * 0.2), frames.length)
  
  let maxY = -Infinity // Lowest point in frame = standing
  let baselineFrame: number | null = null

  for (let i = 0; i < searchEnd; i++) {
    const hipCenter = getHipCenterFromFrame(frames[i])
    
    if (hipCenter.isValid && hipCenter.position.y > maxY) {
      maxY = hipCenter.position.y
      baselineFrame = i
    }
  }

  return baselineFrame
}

// ==========================================
// FULL JUMP ANALYSIS
// ==========================================

/**
 * Comprehensive jump analysis
 */
export function analyzeJump(
  frames: PoseFrame[],
  fps: number,
  providedKeyframes?: {
    start?: number | null
    peakJump?: number | null
    end?: number | null
  }
): JumpAnalysis {
  // Default invalid result
  const invalidResult: JumpAnalysis = {
    heightNormalized: 0,
    heightPercentage: 0,
    takeoffFrame: null,
    peakFrame: null,
    landingFrame: null,
    flightTime: null,
    peakVelocity: 0,
    confidence: 0,
    isValid: false,
  }

  if (!frames || frames.length < 10 || fps <= 0) {
    return invalidResult
  }

  // Determine keyframes
  const baselineFrame = providedKeyframes?.start ?? findBaselineFrame(frames)
  const peakFrame = providedKeyframes?.peakJump ?? findPeakJumpFrame(frames)
  const endFrame = providedKeyframes?.end ?? frames.length - 1

  if (baselineFrame === null || peakFrame === null) {
    return invalidResult
  }

  // Calculate jump height
  const heightResult = estimateJumpHeight(frames, peakFrame, baselineFrame)
  
  if (!heightResult.isValid) {
    return invalidResult
  }

  // Detect takeoff frame (when upward velocity becomes significant)
  let takeoffFrame: number | null = null
  for (let i = baselineFrame; i < peakFrame; i++) {
    if (i + 1 >= frames.length) break
    
    const hipCenter1 = getHipCenterFromFrame(frames[i])
    const hipCenter2 = getHipCenterFromFrame(frames[i + 1])
    
    if (hipCenter1.isValid && hipCenter2.isValid) {
      const velocity = calculateVerticalVelocityPhysics(
        hipCenter1.position,
        hipCenter2.position,
        fps
      )
      
      // Significant upward velocity indicates takeoff
      if (velocity > 0.5) {
        takeoffFrame = i
        break
      }
    }
  }

  // Detect landing frame (when downward velocity becomes near zero after peak)
  let landingFrame: number | null = null
  for (let i = peakFrame + 1; i < Math.min(endFrame, frames.length - 1); i++) {
    const hipCenter1 = getHipCenterFromFrame(frames[i])
    const hipCenter2 = getHipCenterFromFrame(frames[i + 1])
    
    if (hipCenter1.isValid && hipCenter2.isValid) {
      const velocity = calculateVerticalVelocityPhysics(
        hipCenter1.position,
        hipCenter2.position,
        fps
      )
      
      // Near-zero velocity after downward movement indicates landing
      if (Math.abs(velocity) < 0.3 && i > peakFrame + 3) {
        landingFrame = i
        break
      }
    }
  }

  // Calculate flight time
  let flightTime: number | null = null
  if (takeoffFrame !== null && landingFrame !== null) {
    flightTime = (landingFrame - takeoffFrame) / fps
  }

  // Calculate peak upward velocity
  let peakVelocity = 0
  for (let i = baselineFrame; i < peakFrame && i + 1 < frames.length; i++) {
    const hipCenter1 = getHipCenterFromFrame(frames[i])
    const hipCenter2 = getHipCenterFromFrame(frames[i + 1])
    
    if (hipCenter1.isValid && hipCenter2.isValid) {
      const velocity = calculateVerticalVelocityPhysics(
        hipCenter1.position,
        hipCenter2.position,
        fps
      )
      
      if (velocity > peakVelocity) {
        peakVelocity = velocity
      }
    }
  }

  return {
    heightNormalized: heightResult.heightNormalized,
    heightPercentage: heightResult.heightPercentage,
    takeoffFrame,
    peakFrame,
    landingFrame,
    flightTime,
    peakVelocity,
    confidence: heightResult.confidence,
    isValid: true,
  }
}

// ==========================================
// JUMP HEIGHT TO REAL UNITS
// ==========================================

/**
 * Convert normalized jump height to centimeters
 * Requires knowing the scale factor (from user height input)
 * 
 * @param normalizedHeight - Jump height in normalized units
 * @param scaleFactor - Scale factor (cm per normalized unit)
 */
export function jumpHeightToCm(
  normalizedHeight: number,
  scaleFactor: number
): number {
  return normalizedHeight * scaleFactor
}

/**
 * Estimate scale factor from user's height
 * 
 * Assumes camera captures full body and user takes up ~60-85% of frame height
 * This is a rough approximation; actual calibration is more complex
 * 
 * @param userHeightCm - User's height in centimeters
 * @param bodyHeightInFrame - Approximate height of body in normalized coords (0-1)
 */
export function estimateScaleFactorFromHeight(
  userHeightCm: number,
  bodyHeightInFrame: number = 0.7
): number {
  if (bodyHeightInFrame <= 0) return 0
  return userHeightCm / bodyHeightInFrame
}

// ==========================================
// WHY HIP CENTER IS BETTER THAN ANKLE
// ==========================================

/**
 * HIP CENTER VS ANKLE FOR JUMP HEIGHT:
 * 
 * ANKLE PROBLEMS:
 * 1. Ankle position changes during jump
 *    - Toe pointing changes ankle landmark position
 *    - Landing absorption affects position
 * 
 * 2. Camera angle affects measurement
 *    - Foreshortening when feet move toward/away from camera
 *    - Z-axis movement not captured well
 * 
 * 3. Occlusion issues
 *    - Feet may be partially hidden
 *    - Lower body often has lower confidence
 * 
 * HIP CENTER ADVANTAGES:
 * 1. Represents true center of mass better
 *    - Body rotates around hip area
 *    - Less affected by limb articulation
 * 
 * 2. More stable landmark
 *    - Both hips usually visible
 *    - Higher confidence typically
 * 
 * 3. Better for comparison
 *    - Consistent reference point across athletes
 *    - Works for different body types
 */

export { MIN_VISIBILITY as JUMP_MIN_VISIBILITY }