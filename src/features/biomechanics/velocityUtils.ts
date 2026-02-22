/**
 * Velocity Calculation Utilities
 * 
 * Functions for calculating velocity and speed of body parts.
 * Uses frame-to-frame displacement to approximate velocities.
 * 
 * VELOCITY APPROXIMATION:
 * - velocity = displacement / time
 * - time = 1 / fps
 * - Therefore: velocity = displacement * fps
 * 
 * UNITS:
 * - Displacement is in normalized coords (0-1)
 * - Velocity is in normalized units per second
 * - Multiply by scale factor for cm/s
 */

import { NormalizedPoint, Vector2D, magnitude2D, subtractVectors2D } from './vectorUtils'
import { calculateDistance, DistanceResult } from './distanceUtils'

// ==========================================
// TYPES
// ==========================================

/**
 * Velocity result with direction information
 */
export interface VelocityResult {
  /** Speed (magnitude of velocity) in normalized units/second */
  speed: number
  /** Velocity vector (direction and magnitude) */
  velocity: Vector2D
  /** Horizontal velocity component */
  vx: number
  /** Vertical velocity component (positive = downward in MediaPipe) */
  vy: number
  /** Whether the calculation is valid */
  isValid: boolean
  /** Confidence based on point visibility */
  confidence: number
}

/**
 * Speed-only result (no direction)
 */
export interface SpeedResult {
  /** Speed in normalized units/second */
  speed: number
  /** Whether the calculation is valid */
  isValid: boolean
  /** Confidence */
  confidence: number
}

// ==========================================
// CONSTANTS
// ==========================================

const EPSILON = 1e-10
const MIN_VISIBILITY = 0.3
const DEFAULT_FPS = 30

// ==========================================
// FRAME-TO-FRAME VELOCITY
// ==========================================

/**
 * Calculate velocity between two frames
 * 
 * Formula: velocity = displacement * fps
 * 
 * Where:
 * - displacement = position2 - position1 (in normalized coords)
 * - fps = frames per second
 * - velocity = normalized units per second
 * 
 * @param point1 - Position at frame 1
 * @param point2 - Position at frame 2
 * @param fps - Frames per second
 * @returns Velocity result with magnitude and direction
 */
export function calculateVelocity(
  point1: NormalizedPoint,
  point2: NormalizedPoint,
  fps: number = DEFAULT_FPS
): VelocityResult {
  // Validate inputs
  if (!point1 || !point2) {
    return {
      speed: 0,
      velocity: { x: 0, y: 0 },
      vx: 0,
      vy: 0,
      isValid: false,
      confidence: 0,
    }
  }

  // Check visibility
  const vis1 = point1.visibility ?? 1
  const vis2 = point2.visibility ?? 1
  const confidence = Math.min(vis1, vis2)

  if (vis1 < MIN_VISIBILITY || vis2 < MIN_VISIBILITY) {
    return {
      speed: 0,
      velocity: { x: 0, y: 0 },
      vx: 0,
      vy: 0,
      isValid: false,
      confidence,
    }
  }

  // Validate FPS
  const safeFps = fps > 0 ? fps : DEFAULT_FPS

  // Calculate displacement
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y

  // Calculate velocity (displacement * fps)
  const vx = dx * safeFps
  const vy = dy * safeFps

  // Calculate speed (magnitude of velocity)
  const speed = Math.sqrt(vx * vx + vy * vy)

  return {
    speed,
    velocity: { x: vx, y: vy },
    vx,
    vy,
    isValid: true,
    confidence,
  }
}

/**
 * Calculate speed only (no direction)
 * More efficient if direction isn't needed
 */
export function calculateSpeed(
  point1: NormalizedPoint,
  point2: NormalizedPoint,
  fps: number = DEFAULT_FPS
): SpeedResult {
  const distResult = calculateDistance(point1, point2)

  if (!distResult.isValid) {
    return {
      speed: 0,
      isValid: false,
      confidence: distResult.confidence,
    }
  }

  const safeFps = fps > 0 ? fps : DEFAULT_FPS
  const speed = distResult.normalized * safeFps

  return {
    speed,
    isValid: true,
    confidence: distResult.confidence,
  }
}

// ==========================================
// DIRECTIONAL VELOCITIES
// ==========================================

/**
 * Calculate vertical velocity only
 * Positive = moving downward (MediaPipe coords)
 * For physics, negate the result
 */
export function calculateVerticalVelocity(
  point1: NormalizedPoint,
  point2: NormalizedPoint,
  fps: number = DEFAULT_FPS
): number {
  if (!point1 || !point2) return 0

  const dy = point2.y - point1.y
  return dy * fps
}

/**
 * Calculate vertical velocity in physics coordinates
 * Positive = moving upward
 */
export function calculateVerticalVelocityPhysics(
  point1: NormalizedPoint,
  point2: NormalizedPoint,
  fps: number = DEFAULT_FPS
): number {
  // Invert because MediaPipe Y increases downward
  return -calculateVerticalVelocity(point1, point2, fps)
}

/**
 * Calculate horizontal velocity
 * Positive = moving right
 */
export function calculateHorizontalVelocity(
  point1: NormalizedPoint,
  point2: NormalizedPoint,
  fps: number = DEFAULT_FPS
): number {
  if (!point1 || !point2) return 0

  const dx = point2.x - point1.x
  return dx * fps
}

// ==========================================
// ACCELERATION
// ==========================================

/**
 * Calculate acceleration between three frames
 * acceleration = (velocity2 - velocity1) / time
 */
export function calculateAcceleration(
  point1: NormalizedPoint,
  point2: NormalizedPoint,
  point3: NormalizedPoint,
  fps: number = DEFAULT_FPS
): Vector2D {
  if (!point1 || !point2 || !point3) {
    return { x: 0, y: 0 }
  }

  // Calculate velocities
  const v1 = calculateVelocity(point1, point2, fps)
  const v2 = calculateVelocity(point2, point3, fps)

  if (!v1.isValid || !v2.isValid) {
    return { x: 0, y: 0 }
  }

  // Acceleration = change in velocity * fps
  const ax = (v2.vx - v1.vx) * fps
  const ay = (v2.vy - v1.vy) * fps

  return { x: ax, y: ay }
}

// ==========================================
// VELOCITY OVER MULTIPLE FRAMES
// ==========================================

/**
 * Calculate average velocity over a range of frames
 * More stable than frame-to-frame velocity
 */
export function calculateAverageVelocity(
  points: NormalizedPoint[],
  fps: number = DEFAULT_FPS
): VelocityResult {
  if (!points || points.length < 2) {
    return {
      speed: 0,
      velocity: { x: 0, y: 0 },
      vx: 0,
      vy: 0,
      isValid: false,
      confidence: 0,
    }
  }

  const first = points[0]
  const last = points[points.length - 1]
  const numFrames = points.length - 1

  // Time for numFrames at given fps
  const time = numFrames / fps

  if (time < EPSILON) {
    return {
      speed: 0,
      velocity: { x: 0, y: 0 },
      vx: 0,
      vy: 0,
      isValid: false,
      confidence: 0,
    }
  }

  // Calculate displacement
  const dx = last.x - first.x
  const dy = last.y - first.y

  // Calculate velocity
  const vx = dx / time
  const vy = dy / time
  const speed = Math.sqrt(vx * vx + vy * vy)

  // Calculate average confidence
  const totalVis = points.reduce((sum, p) => sum + (p.visibility ?? 1), 0)
  const avgConfidence = totalVis / points.length

  return {
    speed,
    velocity: { x: vx, y: vy },
    vx,
    vy,
    isValid: avgConfidence >= MIN_VISIBILITY,
    confidence: avgConfidence,
  }
}

/**
 * Calculate peak velocity in a sequence of points
 */
export function calculatePeakVelocity(
  points: NormalizedPoint[],
  fps: number = DEFAULT_FPS
): { peakSpeed: number; peakFrameIndex: number } {
  if (!points || points.length < 2) {
    return { peakSpeed: 0, peakFrameIndex: 0 }
  }

  let peakSpeed = 0
  let peakFrameIndex = 0

  for (let i = 1; i < points.length; i++) {
    const speedResult = calculateSpeed(points[i - 1], points[i], fps)
    
    if (speedResult.isValid && speedResult.speed > peakSpeed) {
      peakSpeed = speedResult.speed
      peakFrameIndex = i
    }
  }

  return { peakSpeed, peakFrameIndex }
}

// ==========================================
// VELOCITY TO REAL UNITS
// ==========================================

/**
 * Convert normalized velocity to real units (cm/s)
 * 
 * @param normalizedVelocity - Velocity in normalized units/second
 * @param scaleFactor - Scale factor (cm per normalized unit)
 */
export function velocityToReal(
  normalizedVelocity: number,
  scaleFactor: number
): number {
  return normalizedVelocity * scaleFactor
}

/**
 * Convert velocity from cm/s to m/s
 */
export function cmPerSecToMPerSec(cmPerSec: number): number {
  return cmPerSec / 100
}

// ==========================================
// APPROXIMATION LIMITS EXPLANATION
// ==========================================

/**
 * VELOCITY APPROXIMATION NOTES:
 * 
 * 1. FRAME RATE DEPENDENCY
 *    - Lower FPS = less accurate velocity estimates
 *    - 30fps gives ~33ms between frames
 *    - Fast movements may be under-sampled
 * 
 * 2. DISCRETE SAMPLING
 *    - We only see positions at discrete time points
 *    - True velocity between frames is unknown
 *    - This is "average velocity over frame interval"
 * 
 * 3. NOISE AMPLIFICATION
 *    - Small position errors become large velocity errors
 *    - Smoothing helps reduce this
 *    - Multi-frame averaging is more reliable
 * 
 * 4. WHY THIS IS GOOD ENOUGH FOR MVP:
 *    - Relative velocities are useful for comparison
 *    - Peak detection works well with discrete data
 *    - Qualitative speed assessment (fast/slow) is accurate
 *    - Sports analysis doesn't need physics-simulation precision
 */

export { DEFAULT_FPS, EPSILON as VELOCITY_EPSILON, MIN_VISIBILITY as VELOCITY_MIN_VISIBILITY }