/**
 * Vector Math Utilities
 * 
 * Core vector operations for biomechanical calculations.
 * All functions are pure (no side effects) and handle edge cases.
 * 
 * WHY VECTOR MATH IS REQUIRED:
 * - Joint angles are calculated using vectors between landmarks
 * - Velocity is a vector (direction + magnitude)
 * - Body segment orientation requires vector normalization
 * - Dot product gives angle between vectors
 */

// ==========================================
// TYPES
// ==========================================

/**
 * 2D Vector representation
 */
export interface Vector2D {
  x: number
  y: number
}

/**
 * 3D Vector representation (includes depth)
 */
export interface Vector3D {
  x: number
  y: number
  z: number
}

/**
 * Point in normalized coordinate space (0-1)
 */
export interface NormalizedPoint {
  x: number
  y: number
  z?: number
  visibility?: number
}

// ==========================================
// CONSTANTS
// ==========================================

/** Small value to prevent division by zero */
const EPSILON = 1e-10

/** Zero vector for comparisons */
export const ZERO_VECTOR_2D: Vector2D = { x: 0, y: 0 }
export const ZERO_VECTOR_3D: Vector3D = { x: 0, y: 0, z: 0 }

// ==========================================
// VECTOR CREATION
// ==========================================

/**
 * Create a 2D vector from two points
 * Vector points from 'from' to 'to'
 */
export function createVector2D(
  from: NormalizedPoint,
  to: NormalizedPoint
): Vector2D {
  return {
    x: to.x - from.x,
    y: to.y - from.y,
  }
}

/**
 * Create a 3D vector from two points
 */
export function createVector3D(
  from: NormalizedPoint,
  to: NormalizedPoint
): Vector3D {
  return {
    x: to.x - from.x,
    y: to.y - from.y,
    z: (to.z ?? 0) - (from.z ?? 0),
  }
}

// ==========================================
// BASIC OPERATIONS
// ==========================================

/**
 * Subtract vector B from vector A
 * Result: A - B (vector from B to A)
 * 
 * @example
 * subtractVectors({x: 5, y: 3}, {x: 2, y: 1}) // {x: 3, y: 2}
 */
export function subtractVectors2D(a: Vector2D, b: Vector2D): Vector2D {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  }
}

export function subtractVectors3D(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  }
}

/**
 * Add two vectors
 */
export function addVectors2D(a: Vector2D, b: Vector2D): Vector2D {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  }
}

export function addVectors3D(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  }
}

/**
 * Multiply vector by scalar
 */
export function scaleVector2D(v: Vector2D, scalar: number): Vector2D {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
  }
}

export function scaleVector3D(v: Vector3D, scalar: number): Vector3D {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar,
  }
}

// ==========================================
// DOT PRODUCT
// ==========================================

/**
 * Calculate dot product of two 2D vectors
 * 
 * Mathematical meaning:
 * - a · b = |a| * |b| * cos(θ)
 * - Positive: vectors point in similar direction
 * - Zero: vectors are perpendicular
 * - Negative: vectors point in opposite directions
 * 
 * @example
 * dotProduct2D({x: 1, y: 0}, {x: 0, y: 1}) // 0 (perpendicular)
 * dotProduct2D({x: 1, y: 0}, {x: 1, y: 0}) // 1 (same direction)
 */
export function dotProduct2D(a: Vector2D, b: Vector2D): number {
  return a.x * b.x + a.y * b.y
}

/**
 * Calculate dot product of two 3D vectors
 */
export function dotProduct3D(a: Vector3D, b: Vector3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

// ==========================================
// CROSS PRODUCT (3D only, returns scalar for 2D)
// ==========================================

/**
 * Calculate 2D cross product (returns scalar z-component)
 * Useful for determining rotation direction
 * 
 * Positive: B is counter-clockwise from A
 * Negative: B is clockwise from A
 */
export function crossProduct2D(a: Vector2D, b: Vector2D): number {
  return a.x * b.y - a.y * b.x
}

/**
 * Calculate 3D cross product
 * Returns vector perpendicular to both inputs
 */
export function crossProduct3D(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
}

// ==========================================
// MAGNITUDE (LENGTH)
// ==========================================

/**
 * Calculate magnitude (length) of a 2D vector
 * 
 * @example
 * magnitude2D({x: 3, y: 4}) // 5 (3-4-5 triangle)
 */
export function magnitude2D(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

/**
 * Calculate magnitude of a 3D vector
 */
export function magnitude3D(v: Vector3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

/**
 * Calculate squared magnitude (faster, avoids sqrt)
 * Useful for comparisons where actual distance isn't needed
 */
export function magnitudeSquared2D(v: Vector2D): number {
  return v.x * v.x + v.y * v.y
}

export function magnitudeSquared3D(v: Vector3D): number {
  return v.x * v.x + v.y * v.y + v.z * v.z
}

// ==========================================
// NORMALIZATION
// ==========================================

/**
 * Normalize a 2D vector to unit length (magnitude = 1)
 * Returns zero vector if input has zero magnitude
 * 
 * @example
 * normalizeVector2D({x: 3, y: 4}) // {x: 0.6, y: 0.8}
 */
export function normalizeVector2D(v: Vector2D): Vector2D {
  const mag = magnitude2D(v)
  
  if (mag < EPSILON) {
    // Cannot normalize zero vector
    return { x: 0, y: 0 }
  }
  
  return {
    x: v.x / mag,
    y: v.y / mag,
  }
}

/**
 * Normalize a 3D vector to unit length
 */
export function normalizeVector3D(v: Vector3D): Vector3D {
  const mag = magnitude3D(v)
  
  if (mag < EPSILON) {
    return { x: 0, y: 0, z: 0 }
  }
  
  return {
    x: v.x / mag,
    y: v.y / mag,
    z: v.z / mag,
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Check if a vector is effectively zero
 */
export function isZeroVector2D(v: Vector2D): boolean {
  return Math.abs(v.x) < EPSILON && Math.abs(v.y) < EPSILON
}

export function isZeroVector3D(v: Vector3D): boolean {
  return Math.abs(v.x) < EPSILON && Math.abs(v.y) < EPSILON && Math.abs(v.z) < EPSILON
}

/**
 * Calculate the angle of a 2D vector from the positive X-axis
 * Returns angle in radians (-π to π)
 */
export function vectorAngle2D(v: Vector2D): number {
  return Math.atan2(v.y, v.x)
}

/**
 * Calculate the angle of a 2D vector in degrees
 * Returns angle in degrees (-180 to 180)
 */
export function vectorAngleDegrees2D(v: Vector2D): number {
  return vectorAngle2D(v) * (180 / Math.PI)
}

/**
 * Rotate a 2D vector by an angle (in radians)
 */
export function rotateVector2D(v: Vector2D, angleRadians: number): Vector2D {
  const cos = Math.cos(angleRadians)
  const sin = Math.sin(angleRadians)
  
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  }
}

/**
 * Project vector A onto vector B
 * Returns the component of A in the direction of B
 */
export function projectVector2D(a: Vector2D, b: Vector2D): Vector2D {
  const bMagSq = magnitudeSquared2D(b)
  
  if (bMagSq < EPSILON) {
    return { x: 0, y: 0 }
  }
  
  const scalar = dotProduct2D(a, b) / bMagSq
  return scaleVector2D(b, scalar)
}

/**
 * Get perpendicular vector (rotated 90 degrees counter-clockwise)
 */
export function perpendicularVector2D(v: Vector2D): Vector2D {
  return { x: -v.y, y: v.x }
}

/**
 * Linearly interpolate between two vectors
 * t = 0 returns a, t = 1 returns b
 */
export function lerpVector2D(a: Vector2D, b: Vector2D, t: number): Vector2D {
  const clampedT = Math.max(0, Math.min(1, t))
  return {
    x: a.x + (b.x - a.x) * clampedT,
    y: a.y + (b.y - a.y) * clampedT,
  }
}

export function lerpVector3D(a: Vector3D, b: Vector3D, t: number): Vector3D {
  const clampedT = Math.max(0, Math.min(1, t))
  return {
    x: a.x + (b.x - a.x) * clampedT,
    y: a.y + (b.y - a.y) * clampedT,
    z: a.z + (b.z - a.z) * clampedT,
  }
}

// ==========================================
// COORDINATE CONVERSION
// ==========================================

/**
 * Convert MediaPipe Y coordinate to physics Y coordinate
 * MediaPipe: Y increases downward (0 = top)
 * Physics: Y increases upward (0 = bottom)
 */
export function invertY(point: NormalizedPoint): NormalizedPoint {
  return {
    ...point,
    y: 1 - point.y,
  }
}

/**
 * Convert entire point to physics coordinate system
 */
export function toPhysicsCoordinates(point: NormalizedPoint): NormalizedPoint {
  return invertY(point)
}

/**
 * Convert from physics coordinates back to MediaPipe coordinates
 */
export function toMediaPipeCoordinates(point: NormalizedPoint): NormalizedPoint {
  return invertY(point) // Same operation (inverse of inverse)
}