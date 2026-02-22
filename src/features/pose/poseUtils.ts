/**
 * Pose Detection Utilities
 * 
 * Helper functions for validating and processing pose landmarks.
 * These utilities prevent math errors in metric calculations.
 */

import {
  NormalizedLandmark,
  PoseFrame,
  LandmarkIndex,
  KEY_LANDMARKS,
} from './types'

// ==========================================
// VALIDATION CONSTANTS
// ==========================================

/** Minimum visibility threshold for a landmark to be considered valid */
const MIN_VISIBILITY_THRESHOLD = 0.5

/** Minimum number of key landmarks required for valid pose */
const MIN_KEY_LANDMARKS_REQUIRED = 8

/** Expected number of landmarks from MediaPipe Pose */
const EXPECTED_LANDMARK_COUNT = 33

// ==========================================
// LANDMARK VALIDATION
// ==========================================

/**
 * Check if a single landmark is valid
 * A landmark is valid if:
 * - Coordinates are within normalized range (0-1)
 * - Visibility is above threshold
 */
export function isLandmarkValid(
  landmark: NormalizedLandmark | undefined,
  visibilityThreshold: number = MIN_VISIBILITY_THRESHOLD
): boolean {
  if (!landmark) return false

  // Check coordinate bounds
  const { x, y, visibility } = landmark
  
  if (x < 0 || x > 1 || y < 0 || y > 1) {
    return false
  }

  // Check visibility
  if (visibility !== undefined && visibility < visibilityThreshold) {
    return false
  }

  return true
}

/**
 * Validate an entire landmarks array
 * Returns true if we have enough valid landmarks for analysis
 */
export function validateLandmarks(
  landmarks: NormalizedLandmark[] | undefined,
  visibilityThreshold: number = MIN_VISIBILITY_THRESHOLD
): { isValid: boolean; validCount: number; totalCount: number; issues: string[] } {
  const issues: string[] = []

  // Check if landmarks exist
  if (!landmarks) {
    return {
      isValid: false,
      validCount: 0,
      totalCount: 0,
      issues: ['No landmarks provided'],
    }
  }

  // Check landmark count
  if (landmarks.length !== EXPECTED_LANDMARK_COUNT) {
    issues.push(`Expected ${EXPECTED_LANDMARK_COUNT} landmarks, got ${landmarks.length}`)
  }

  // Count valid landmarks
  let validCount = 0
  for (let i = 0; i < landmarks.length; i++) {
    if (isLandmarkValid(landmarks[i], visibilityThreshold)) {
      validCount++
    }
  }

  // Check key landmarks specifically
  const keyLandmarksValid = KEY_LANDMARKS.ALL_KEY.filter(
    (index) => isLandmarkValid(landmarks[index], visibilityThreshold)
  ).length

  if (keyLandmarksValid < MIN_KEY_LANDMARKS_REQUIRED) {
    issues.push(
      `Only ${keyLandmarksValid}/${KEY_LANDMARKS.ALL_KEY.length} key landmarks visible`
    )
  }

  const isValid = 
    landmarks.length === EXPECTED_LANDMARK_COUNT &&
    keyLandmarksValid >= MIN_KEY_LANDMARKS_REQUIRED

  return {
    isValid,
    validCount,
    totalCount: landmarks.length,
    issues,
  }
}

/**
 * Count valid landmarks in an array
 */
export function countValidLandmarks(
  landmarks: NormalizedLandmark[],
  visibilityThreshold: number = MIN_VISIBILITY_THRESHOLD
): number {
  return landmarks.filter((lm) => isLandmarkValid(lm, visibilityThreshold)).length
}

/**
 * Filter out low confidence landmarks (set to null/undefined values)
 * Returns a copy with low-confidence points zeroed out
 */
export function filterLowConfidencePoints(
  landmarks: NormalizedLandmark[],
  visibilityThreshold: number = MIN_VISIBILITY_THRESHOLD
): NormalizedLandmark[] {
  return landmarks.map((landmark) => {
    if (!isLandmarkValid(landmark, visibilityThreshold)) {
      return {
        x: 0,
        y: 0,
        z: 0,
        visibility: 0,
      }
    }
    return { ...landmark }
  })
}

// ==========================================
// LANDMARK ACCESS HELPERS
// ==========================================

/**
 * Get a specific landmark by index with validation
 */
export function getLandmark(
  landmarks: NormalizedLandmark[],
  index: LandmarkIndex
): NormalizedLandmark | null {
  const landmark = landmarks[index]
  
  if (!landmark || !isLandmarkValid(landmark)) {
    return null
  }
  
  return landmark
}

/**
 * Get multiple landmarks with validation
 */
export function getLandmarks(
  landmarks: NormalizedLandmark[],
  indices: LandmarkIndex[]
): (NormalizedLandmark | null)[] {
  return indices.map((index) => getLandmark(landmarks, index))
}

/**
 * Check if all specified landmarks are valid
 */
export function hasAllLandmarks(
  landmarks: NormalizedLandmark[],
  indices: LandmarkIndex[]
): boolean {
  return indices.every((index) => getLandmark(landmarks, index) !== null)
}

// ==========================================
// COORDINATE CALCULATIONS
// ==========================================

/**
 * Calculate distance between two landmarks
 */
export function landmarkDistance(
  a: NormalizedLandmark,
  b: NormalizedLandmark
): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Calculate 3D distance between two landmarks
 */
export function landmark3DDistance(
  a: NormalizedLandmark,
  b: NormalizedLandmark
): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dz = b.z - a.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Calculate midpoint between two landmarks
 */
export function landmarkMidpoint(
  a: NormalizedLandmark,
  b: NormalizedLandmark
): NormalizedLandmark {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
    visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1),
  }
}

/**
 * Calculate angle between three landmarks (in degrees)
 * The angle is at point B (middle point)
 */
export function calculateAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
): number {
  // Vector BA
  const baX = a.x - b.x
  const baY = a.y - b.y
  
  // Vector BC
  const bcX = c.x - b.x
  const bcY = c.y - b.y
  
  // Dot product
  const dotProduct = baX * bcX + baY * bcY
  
  // Magnitudes
  const magnitudeBA = Math.sqrt(baX * baX + baY * baY)
  const magnitudeBC = Math.sqrt(bcX * bcX + bcY * bcY)
  
  // Avoid division by zero
  if (magnitudeBA === 0 || magnitudeBC === 0) {
    return 0
  }
  
  // Calculate angle in radians
  const cosAngle = dotProduct / (magnitudeBA * magnitudeBC)
  
  // Clamp to [-1, 1] to handle floating point errors
  const clampedCos = Math.max(-1, Math.min(1, cosAngle))
  
  // Convert to degrees
  const angleRadians = Math.acos(clampedCos)
  const angleDegrees = angleRadians * (180 / Math.PI)
  
  return angleDegrees
}

// ==========================================
// FRAME ANALYSIS HELPERS
// ==========================================

/**
 * Calculate average confidence for a frame
 */
export function calculateFrameConfidence(
  landmarks: NormalizedLandmark[]
): number {
  if (landmarks.length === 0) return 0
  
  const totalVisibility = landmarks.reduce((sum, lm) => {
    return sum + (lm.visibility ?? 0)
  }, 0)
  
  return totalVisibility / landmarks.length
}

/**
 * Find the best frame (highest confidence) from a set of frames
 */
export function findBestFrame(frames: PoseFrame[]): PoseFrame | null {
  if (frames.length === 0) return null
  
  return frames.reduce((best, current) => {
    return current.confidence > best.confidence ? current : best
  })
}

/**
 * Filter frames to only include those with valid poses
 */
export function filterValidFrames(
  frames: PoseFrame[],
  minConfidence: number = 0.5
): PoseFrame[] {
  return frames.filter((frame) => {
    return frame.confidence >= minConfidence &&
           validateLandmarks(frame.landmarks).isValid
  })
}

// ==========================================
// STATISTICS
// ==========================================

/**
 * Calculate statistics for a set of frames
 */
export function calculateFrameStats(frames: PoseFrame[]): {
  avgConfidence: number
  minConfidence: number
  maxConfidence: number
  validFrameCount: number
  invalidFrameCount: number
} {
  if (frames.length === 0) {
    return {
      avgConfidence: 0,
      minConfidence: 0,
      maxConfidence: 0,
      validFrameCount: 0,
      invalidFrameCount: 0,
    }
  }

  const confidences = frames.map((f) => f.confidence)
  const validFrames = frames.filter(
    (f) => validateLandmarks(f.landmarks).isValid
  )

  return {
    avgConfidence: confidences.reduce((a, b) => a + b, 0) / confidences.length,
    minConfidence: Math.min(...confidences),
    maxConfidence: Math.max(...confidences),
    validFrameCount: validFrames.length,
    invalidFrameCount: frames.length - validFrames.length,
  }
}

// ==========================================
// CONVERSION HELPERS
// ==========================================

/**
 * Convert normalized coordinates to pixel coordinates
 */
export function normalizedToPixel(
  landmark: NormalizedLandmark,
  width: number,
  height: number
): { x: number; y: number; z: number } {
  return {
    x: landmark.x * width,
    y: landmark.y * height,
    z: landmark.z * width, // Z is also normalized to image width
  }
}

/**
 * Convert pixel coordinates to normalized coordinates
 */
export function pixelToNormalized(
  x: number,
  y: number,
  z: number,
  width: number,
  height: number
): NormalizedLandmark {
  return {
    x: x / width,
    y: y / height,
    z: z / width,
    visibility: 1,
  }
}

// ==========================================
// WHY VALIDATION PREVENTS ERRORS
// ==========================================

/**
 * Why validation is critical:
 * 
 * 1. MATH ERRORS
 *    - Division by zero in angle calculations
 *    - NaN from invalid coordinates
 *    - Infinity from out-of-bounds values
 * 
 * 2. UI CRASHES
 *    - Drawing outside canvas bounds
 *    - Invalid SVG path coordinates
 *    - React rendering errors from NaN
 * 
 * 3. METRICS ACCURACY
 *    - Low-confidence points skew averages
 *    - Occluded body parts give wrong angles
 *    - Frame drops cause jerky analysis
 * 
 * 4. DOWNSTREAM EFFECTS
 *    - Bad frame affects entire score
 *    - One invalid landmark propagates to related metrics
 *    - Comparison to pro data becomes meaningless
 * 
 * By validating early, we ensure all downstream code
 * receives clean, reliable data.
 */