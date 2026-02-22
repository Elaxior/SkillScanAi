/**
 * Distance Calculation Utilities
 * 
 * Functions for measuring distances between landmarks.
 * All distances are in normalized coordinates (0-1).
 * 
 * NORMALIZATION NOTE:
 * To convert to real-world units, multiply by user's height:
 *   realDistance = normalizedDistance * userHeightCm * heightScaleFactor
 */

import { NormalizedPoint, magnitude2D, magnitude3D, Vector2D } from './vectorUtils'

// ==========================================
// TYPES
// ==========================================

/**
 * Result of distance calculation with metadata
 */
export interface DistanceResult {
  /** Distance in normalized units (0-1) */
  normalized: number
  /** Whether the calculation is valid */
  isValid: boolean
  /** Confidence based on point visibility */
  confidence: number
}

// ==========================================
// CONSTANTS
// ==========================================

const EPSILON = 1e-10
const MIN_VISIBILITY = 0.3

// ==========================================
// BASIC DISTANCE CALCULATIONS
// ==========================================

/**
 * Calculate Euclidean distance between two points (2D)
 * 
 * @example
 * calculateDistance({x: 0, y: 0}, {x: 3, y: 4}) // 5
 */
export function calculateDistance(
  pointA: NormalizedPoint,
  pointB: NormalizedPoint
): DistanceResult {
  // Validate inputs
  if (!pointA || !pointB) {
    return {
      normalized: 0,
      isValid: false,
      confidence: 0,
    }
  }

  // Calculate confidence
  const visA = pointA.visibility ?? 1
  const visB = pointB.visibility ?? 1
  const confidence = Math.min(visA, visB)

  // Check minimum visibility
  if (visA < MIN_VISIBILITY || visB < MIN_VISIBILITY) {
    return {
      normalized: 0,
      isValid: false,
      confidence,
    }
  }

  // Calculate 2D distance
  const dx = pointB.x - pointA.x
  const dy = pointB.y - pointA.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  return {
    normalized: distance,
    isValid: true,
    confidence,
  }
}

/**
 * Calculate 3D distance (including depth)
 */
export function calculateDistance3D(
  pointA: NormalizedPoint,
  pointB: NormalizedPoint
): DistanceResult {
  if (!pointA || !pointB) {
    return {
      normalized: 0,
      isValid: false,
      confidence: 0,
    }
  }

  const visA = pointA.visibility ?? 1
  const visB = pointB.visibility ?? 1
  const confidence = Math.min(visA, visB)

  if (visA < MIN_VISIBILITY || visB < MIN_VISIBILITY) {
    return {
      normalized: 0,
      isValid: false,
      confidence,
    }
  }

  const dx = pointB.x - pointA.x
  const dy = pointB.y - pointA.y
  const dz = (pointB.z ?? 0) - (pointA.z ?? 0)
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

  return {
    normalized: distance,
    isValid: true,
    confidence,
  }
}

// ==========================================
// DIRECTIONAL DISTANCES
// ==========================================

/**
 * Calculate horizontal distance (X-axis only)
 * Positive = B is to the right of A
 */
export function calculateHorizontalDistance(
  pointA: NormalizedPoint,
  pointB: NormalizedPoint
): DistanceResult {
  if (!pointA || !pointB) {
    return {
      normalized: 0,
      isValid: false,
      confidence: 0,
    }
  }

  const visA = pointA.visibility ?? 1
  const visB = pointB.visibility ?? 1
  const confidence = Math.min(visA, visB)

  // Horizontal distance (can be negative)
  const distance = pointB.x - pointA.x

  return {
    normalized: distance,
    isValid: visA >= MIN_VISIBILITY && visB >= MIN_VISIBILITY,
    confidence,
  }
}

/**
 * Calculate vertical distance (Y-axis only)
 * Positive = B is below A (in MediaPipe coordinates)
 * 
 * NOTE: In MediaPipe, Y increases downward
 * For physics interpretation, invert the sign
 */
export function calculateVerticalDistance(
  pointA: NormalizedPoint,
  pointB: NormalizedPoint
): DistanceResult {
  if (!pointA || !pointB) {
    return {
      normalized: 0,
      isValid: false,
      confidence: 0,
    }
  }

  const visA = pointA.visibility ?? 1
  const visB = pointB.visibility ?? 1
  const confidence = Math.min(visA, visB)

  // Vertical distance in MediaPipe coords
  const distance = pointB.y - pointA.y

  return {
    normalized: distance,
    isValid: visA >= MIN_VISIBILITY && visB >= MIN_VISIBILITY,
    confidence,
  }
}

/**
 * Calculate vertical distance in physics coordinates
 * Positive = B is above A (natural interpretation)
 */
export function calculateVerticalDistancePhysics(
  pointA: NormalizedPoint,
  pointB: NormalizedPoint
): DistanceResult {
  const result = calculateVerticalDistance(pointA, pointB)
  // Invert for physics coordinates
  return {
    ...result,
    normalized: -result.normalized,
  }
}

// ==========================================
// BODY SEGMENT LENGTHS
// ==========================================

/**
 * Calculate upper arm length (shoulder to elbow)
 */
export function calculateUpperArmLength(
  shoulder: NormalizedPoint,
  elbow: NormalizedPoint
): DistanceResult {
  return calculateDistance(shoulder, elbow)
}

/**
 * Calculate forearm length (elbow to wrist)
 */
export function calculateForearmLength(
  elbow: NormalizedPoint,
  wrist: NormalizedPoint
): DistanceResult {
  return calculateDistance(elbow, wrist)
}

/**
 * Calculate full arm length (shoulder to wrist)
 */
export function calculateFullArmLength(
  shoulder: NormalizedPoint,
  wrist: NormalizedPoint
): DistanceResult {
  return calculateDistance(shoulder, wrist)
}

/**
 * Calculate thigh length (hip to knee)
 */
export function calculateThighLength(
  hip: NormalizedPoint,
  knee: NormalizedPoint
): DistanceResult {
  return calculateDistance(hip, knee)
}

/**
 * Calculate shin length (knee to ankle)
 */
export function calculateShinLength(
  knee: NormalizedPoint,
  ankle: NormalizedPoint
): DistanceResult {
  return calculateDistance(knee, ankle)
}

/**
 * Calculate torso length (shoulder midpoint to hip midpoint)
 */
export function calculateTorsoLength(
  leftShoulder: NormalizedPoint,
  rightShoulder: NormalizedPoint,
  leftHip: NormalizedPoint,
  rightHip: NormalizedPoint
): DistanceResult {
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return {
      normalized: 0,
      isValid: false,
      confidence: 0,
    }
  }

  const shoulderMid: NormalizedPoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
    visibility: Math.min(
      leftShoulder.visibility ?? 1,
      rightShoulder.visibility ?? 1
    ),
  }

  const hipMid: NormalizedPoint = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
    visibility: Math.min(
      leftHip.visibility ?? 1,
      rightHip.visibility ?? 1
    ),
  }

  return calculateDistance(shoulderMid, hipMid)
}

// ==========================================
// WIDTH MEASUREMENTS
// ==========================================

/**
 * Calculate shoulder width
 */
export function calculateShoulderWidth(
  leftShoulder: NormalizedPoint,
  rightShoulder: NormalizedPoint
): DistanceResult {
  return calculateDistance(leftShoulder, rightShoulder)
}

/**
 * Calculate hip width
 */
export function calculateHipWidth(
  leftHip: NormalizedPoint,
  rightHip: NormalizedPoint
): DistanceResult {
  return calculateDistance(leftHip, rightHip)
}

/**
 * Calculate stance width (distance between ankles)
 */
export function calculateStanceWidth(
  leftAnkle: NormalizedPoint,
  rightAnkle: NormalizedPoint
): DistanceResult {
  return calculateHorizontalDistance(leftAnkle, rightAnkle)
}

// ==========================================
// DISTANCE RATIOS
// ==========================================

/**
 * Calculate ratio between two distances
 * Useful for checking proportions (e.g., arm fully extended)
 */
export function calculateDistanceRatio(
  distance1: DistanceResult,
  distance2: DistanceResult
): number {
  if (!distance1.isValid || !distance2.isValid) {
    return 0
  }

  if (distance2.normalized < EPSILON) {
    return 0
  }

  return distance1.normalized / distance2.normalized
}

/**
 * Check if arm is extended (current length close to full length)
 * Returns percentage of extension (100% = fully extended)
 */
export function calculateArmExtension(
  shoulder: NormalizedPoint,
  elbow: NormalizedPoint,
  wrist: NormalizedPoint
): number {
  const upperArm = calculateDistance(shoulder, elbow)
  const forearm = calculateDistance(elbow, wrist)
  const fullLength = calculateDistance(shoulder, wrist)

  if (!upperArm.isValid || !forearm.isValid || !fullLength.isValid) {
    return 0
  }

  // Maximum possible length is upperArm + forearm (fully extended)
  const maxLength = upperArm.normalized + forearm.normalized

  if (maxLength < EPSILON) {
    return 0
  }

  // Current length as percentage of max
  const extension = (fullLength.normalized / maxLength) * 100

  return Math.min(100, Math.max(0, extension))
}

// ==========================================
// NORMALIZATION TO REAL UNITS
// ==========================================

/**
 * Estimate the scale factor for converting normalized distances to cm
 * Based on known anatomical proportions
 * 
 * This uses the shoulder width as a reference point, which is approximately:
 * - Average adult male: ~45 cm
 * - Average adult female: ~40 cm
 * 
 * @param shoulderWidthNormalized - Measured shoulder width in normalized units
 * @param referenceShoulderWidthCm - Reference shoulder width in cm
 */
export function estimateScaleFactor(
  shoulderWidthNormalized: number,
  referenceShoulderWidthCm: number = 42
): number {
  if (shoulderWidthNormalized < EPSILON) {
    return 0
  }

  return referenceShoulderWidthCm / shoulderWidthNormalized
}

/**
 * Convert normalized distance to approximate real-world distance
 * 
 * WHY NORMALIZATION MATTERS FOR HEIGHT INPUT:
 * - User inputs their height (e.g., 180cm)
 * - We measure body proportions in normalized coords
 * - Scale factor converts to real units
 * - Jump height becomes: normalizedJump * scaleFactor = cm
 */
export function normalizedToReal(
  normalizedDistance: number,
  scaleFactor: number
): number {
  return normalizedDistance * scaleFactor
}

// ==========================================
// EXPORTS
// ==========================================

export { EPSILON as DISTANCE_EPSILON, MIN_VISIBILITY }