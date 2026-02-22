/**
 * Angle Calculation Utilities
 * 
 * Functions for calculating joint angles from landmark positions.
 * Uses vector math to compute angles between body segments.
 * 
 * ANGLE CONVENTION:
 * - Angles are measured at the middle point (vertex)
 * - Full extension = 180° (straight line)
 * - Full flexion = 0° (completely folded)
 * - Returned in degrees for human readability
 */

import {
  Vector2D,
  NormalizedPoint,
  createVector2D,
  dotProduct2D,
  magnitude2D,
  crossProduct2D,
} from './vectorUtils'

const EPSILON = 1e-10

// ==========================================
// TYPES
// ==========================================

/**
 * Result of angle calculation with metadata
 */
export interface AngleResult {
  /** Angle in degrees (0-180) */
  degrees: number
  /** Angle in radians (0-π) */
  radians: number
  /** Whether the angle is valid (all points had good visibility) */
  isValid: boolean
  /** Confidence based on point visibility */
  confidence: number
}

/**
 * Joint angle specification
 */
export interface JointAngle {
  /** Name of the joint */
  name: string
  /** Angle in degrees */
  angle: number
  /** Confidence score */
  confidence: number
}

// ==========================================
// CORE ANGLE CALCULATION
// ==========================================

/**
 * Calculate the angle at point B formed by points A-B-C
 * 
 * Visual representation:
 *       A
 *      /
 *     / θ  ← This is the angle we calculate
 *    B────C
 * 
 * Mathematical approach:
 * 1. Create vectors BA (from B to A) and BC (from B to C)
 * 2. Use dot product formula: cos(θ) = (BA · BC) / (|BA| * |BC|)
 * 3. Convert to degrees
 * 
 * @param pointA - First endpoint
 * @param pointB - Vertex (where angle is measured)
 * @param pointC - Second endpoint
 * @returns Angle in degrees (0-180)
 */
export function calculateAngle(
  pointA: NormalizedPoint,
  pointB: NormalizedPoint,
  pointC: NormalizedPoint
): AngleResult {
  // Validate inputs
  if (!pointA || !pointB || !pointC) {
    return {
      degrees: 0,
      radians: 0,
      isValid: false,
      confidence: 0,
    }
  }

  // Calculate confidence from visibility
  const visA = pointA.visibility ?? 1
  const visB = pointB.visibility ?? 1
  const visC = pointC.visibility ?? 1
  const confidence = Math.min(visA, visB, visC)

  // Create vectors from B to A and from B to C
  const vectorBA: Vector2D = {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y,
  }

  const vectorBC: Vector2D = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y,
  }

  // Calculate magnitudes
  const magnitudeBA = magnitude2D(vectorBA)
  const magnitudeBC = magnitude2D(vectorBC)

  // Check for zero-length vectors (points are coincident)
  if (magnitudeBA < EPSILON || magnitudeBC < EPSILON) {
    console.warn('[angleUtils] Zero-length vector in angle calculation')
    return {
      degrees: 0,
      radians: 0,
      isValid: false,
      confidence: 0,
    }
  }

  // Calculate dot product
  const dot = dotProduct2D(vectorBA, vectorBC)

  // Calculate cosine of angle
  // cos(θ) = (BA · BC) / (|BA| * |BC|)
  let cosAngle = dot / (magnitudeBA * magnitudeBC)

  // CRITICAL: Clamp to [-1, 1] to prevent NaN from floating point errors
  // Without this, values like 1.0000000001 cause Math.acos to return NaN
  cosAngle = Math.max(-1, Math.min(1, cosAngle))

  // Calculate angle in radians
  const radians = Math.acos(cosAngle)

  // Convert to degrees
  const degrees = radians * (180 / Math.PI)

  return {
    degrees,
    radians,
    isValid: true,
    confidence,
  }
}

/**
 * Calculate angle with visibility threshold
 * Returns null if any point has visibility below threshold
 */
export function calculateAngleWithThreshold(
  pointA: NormalizedPoint,
  pointB: NormalizedPoint,
  pointC: NormalizedPoint,
  visibilityThreshold: number = 0.5
): AngleResult | null {
  // Check visibility
  const visA = pointA?.visibility ?? 0
  const visB = pointB?.visibility ?? 0
  const visC = pointC?.visibility ?? 0

  if (visA < visibilityThreshold || visB < visibilityThreshold || visC < visibilityThreshold) {
    return null
  }

  return calculateAngle(pointA, pointB, pointC)
}

// ==========================================
// SIGNED ANGLE (WITH DIRECTION)
// ==========================================

/**
 * Calculate signed angle from vector A to vector B
 * Positive = counter-clockwise, Negative = clockwise
 * 
 * Useful for determining rotation direction (e.g., arm rotating)
 */
export function calculateSignedAngle(
  vectorA: Vector2D,
  vectorB: Vector2D
): number {
  const magA = magnitude2D(vectorA)
  const magB = magnitude2D(vectorB)

  if (magA < EPSILON || magB < EPSILON) {
    return 0
  }

  // Use atan2 of cross and dot products for signed angle
  const cross = crossProduct2D(vectorA, vectorB)
  const dot = dotProduct2D(vectorA, vectorB)

  const radians = Math.atan2(cross, dot)
  return radians * (180 / Math.PI)
}

/**
 * Calculate signed angle at point B (A-B-C)
 * Positive if C is counter-clockwise from A (relative to B)
 */
export function calculateSignedJointAngle(
  pointA: NormalizedPoint,
  pointB: NormalizedPoint,
  pointC: NormalizedPoint
): number {
  if (!pointA || !pointB || !pointC) {
    return 0
  }

  const vectorBA: Vector2D = {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y,
  }

  const vectorBC: Vector2D = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y,
  }

  return calculateSignedAngle(vectorBA, vectorBC)
}

// ==========================================
// SPECIFIC JOINT ANGLES
// ==========================================

/**
 * Calculate elbow angle
 * Points: Shoulder → Elbow → Wrist
 * 180° = fully extended, 0° = fully flexed
 */
export function calculateElbowAngle(
  shoulder: NormalizedPoint,
  elbow: NormalizedPoint,
  wrist: NormalizedPoint
): AngleResult {
  return calculateAngle(shoulder, elbow, wrist)
}

/**
 * Calculate knee angle
 * Points: Hip → Knee → Ankle
 * 180° = leg straight, 0° = fully bent
 */
export function calculateKneeAngle(
  hip: NormalizedPoint,
  knee: NormalizedPoint,
  ankle: NormalizedPoint
): AngleResult {
  return calculateAngle(hip, knee, ankle)
}

/**
 * Calculate shoulder angle (arm relative to torso)
 * Points: Hip → Shoulder → Elbow
 * This measures how raised the arm is
 */
export function calculateShoulderAngle(
  hip: NormalizedPoint,
  shoulder: NormalizedPoint,
  elbow: NormalizedPoint
): AngleResult {
  return calculateAngle(hip, shoulder, elbow)
}

/**
 * Calculate hip angle (leg relative to torso)
 * Points: Shoulder → Hip → Knee
 */
export function calculateHipAngle(
  shoulder: NormalizedPoint,
  hip: NormalizedPoint,
  knee: NormalizedPoint
): AngleResult {
  return calculateAngle(shoulder, hip, knee)
}

/**
 * Calculate wrist angle (for sports like tennis, golf)
 * Points: Elbow → Wrist → Index finger tip
 */
export function calculateWristAngle(
  elbow: NormalizedPoint,
  wrist: NormalizedPoint,
  indexTip: NormalizedPoint
): AngleResult {
  return calculateAngle(elbow, wrist, indexTip)
}

/**
 * Calculate ankle angle (for running, jumping)
 * Points: Knee → Ankle → Foot
 */
export function calculateAnkleAngle(
  knee: NormalizedPoint,
  ankle: NormalizedPoint,
  foot: NormalizedPoint
): AngleResult {
  return calculateAngle(knee, ankle, foot)
}

// ==========================================
// BODY SEGMENT ANGLES
// ==========================================

/**
 * Calculate torso lean angle from vertical
 * Uses shoulder and hip midpoints
 * 0° = perfectly upright, positive = leaning forward
 */
export function calculateTorsoLean(
  leftShoulder: NormalizedPoint,
  rightShoulder: NormalizedPoint,
  leftHip: NormalizedPoint,
  rightHip: NormalizedPoint
): number {
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return 0
  }

  // Calculate midpoints
  const shoulderMid: NormalizedPoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  }

  const hipMid: NormalizedPoint = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
  }

  // Vector from hip to shoulder
  const torsoVector: Vector2D = {
    x: shoulderMid.x - hipMid.x,
    y: shoulderMid.y - hipMid.y,
  }

  // Vertical reference (remember: Y is inverted in MediaPipe)
  // Upward in image = negative Y direction
  const verticalVector: Vector2D = { x: 0, y: -1 }

  // Calculate angle from vertical
  const angle = calculateSignedAngle(verticalVector, torsoVector)

  return angle
}

/**
 * Calculate shoulder rotation (how much shoulders are twisted)
 * 0° = facing camera, positive = left shoulder forward
 */
export function calculateShoulderRotation(
  leftShoulder: NormalizedPoint,
  rightShoulder: NormalizedPoint
): number {
  if (!leftShoulder || !rightShoulder) {
    return 0
  }

  // Use Z coordinates if available (depth)
  const leftZ = leftShoulder.z ?? 0
  const rightZ = rightShoulder.z ?? 0

  // Calculate rotation based on Z difference
  // This is an approximation - proper 3D rotation is more complex
  const zDiff = leftZ - rightZ
  const xDiff = rightShoulder.x - leftShoulder.x

  if (Math.abs(xDiff) < EPSILON) {
    return 0
  }

  // Approximate rotation angle
  const rotation = Math.atan2(zDiff, xDiff) * (180 / Math.PI)

  return rotation
}

// ==========================================
// ANGLE DIFFERENCE AND COMPARISON
// ==========================================

/**
 * Calculate the smallest difference between two angles
 * Handles wraparound (e.g., 350° to 10° = 20°, not 340°)
 */
export function angleDifference(angle1: number, angle2: number): number {
  let diff = Math.abs(angle1 - angle2)
  
  // Handle wraparound for angles > 180°
  if (diff > 180) {
    diff = 360 - diff
  }

  return diff
}

/**
 * Check if an angle is within a target range
 */
export function isAngleInRange(
  angle: number,
  target: number,
  tolerance: number
): boolean {
  return angleDifference(angle, target) <= tolerance
}

/**
 * Calculate percentage match between user angle and target angle
 * 100% = perfect match, 0% = completely different
 */
export function angleMatchPercentage(
  userAngle: number,
  targetAngle: number,
  maxDeviation: number = 45
): number {
  const diff = angleDifference(userAngle, targetAngle)
  const percentage = Math.max(0, 100 - (diff / maxDeviation) * 100)
  return Math.min(100, percentage)
}

// ==========================================
// WHY CLAMPING PREVENTS NaN ERRORS
// ==========================================

/**
 * CLAMPING EXPLANATION:
 * 
 * The dot product formula gives: cos(θ) = (A·B) / (|A|*|B|)
 * 
 * Mathematically, this should always be in [-1, 1].
 * But floating-point arithmetic can produce values like:
 *   1.0000000000001  (slightly > 1)
 *   -1.0000000000001 (slightly < -1)
 * 
 * Math.acos() is only defined for [-1, 1]:
 *   Math.acos(1.0000001) = NaN  ← CRASH!
 * 
 * By clamping: cosAngle = Math.max(-1, Math.min(1, cosAngle))
 * We ensure valid input to Math.acos() every time.
 * 
 * This is a common defensive programming pattern in graphics/physics.
 */

const EPSILON_EXPORT = EPSILON
export { EPSILON_EXPORT as ANGLE_EPSILON }