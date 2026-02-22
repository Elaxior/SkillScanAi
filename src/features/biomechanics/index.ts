/**
 * Biomechanics Feature Index
 * 
 * Core mathematical utilities for motion analysis.
 * All functions are pure and reusable across sports.
 */

// Vector Utilities
export {
  // Types
  type Vector2D,
  type Vector3D,
  type NormalizedPoint,
  // Constants
  ZERO_VECTOR_2D,
  ZERO_VECTOR_3D,
  // Vector creation
  createVector2D,
  createVector3D,
  // Basic operations
  subtractVectors2D,
  subtractVectors3D,
  addVectors2D,
  addVectors3D,
  scaleVector2D,
  scaleVector3D,
  // Dot product
  dotProduct2D,
  dotProduct3D,
  // Cross product
  crossProduct2D,
  crossProduct3D,
  // Magnitude
  magnitude2D,
  magnitude3D,
  magnitudeSquared2D,
  magnitudeSquared3D,
  // Normalization
  normalizeVector2D,
  normalizeVector3D,
  isZeroVector2D,
  isZeroVector3D,
  // Angle utilities
  vectorAngle2D,
  vectorAngleDegrees2D,
  rotateVector2D,
  // Projection
  projectVector2D,
  perpendicularVector2D,
  // Interpolation
  lerpVector2D,
  lerpVector3D,
  // Coordinate conversion
  invertY,
  toPhysicsCoordinates,
  toMediaPipeCoordinates,
} from './vectorUtils'

// Angle Utilities
export {
  // Types
  type AngleResult,
  type JointAngle,
  // Core angle calculation
  calculateAngle,
  calculateAngleWithThreshold,
  // Signed angles
  calculateSignedAngle,
  calculateSignedJointAngle,
  // Specific joints
  calculateElbowAngle,
  calculateKneeAngle,
  calculateShoulderAngle,
  calculateHipAngle,
  calculateWristAngle,
  calculateAnkleAngle,
  // Body segment angles
  calculateTorsoLean,
  calculateShoulderRotation,
  // Angle comparison
  angleDifference,
  isAngleInRange,
  angleMatchPercentage,
  // Constants
  ANGLE_EPSILON,
} from './angleUtils'

// Distance Utilities
export {
  // Types
  type DistanceResult,
  // Basic distance
  calculateDistance,
  calculateDistance3D,
  // Directional distance
  calculateHorizontalDistance,
  calculateVerticalDistance,
  calculateVerticalDistancePhysics,
  // Body segments
  calculateUpperArmLength,
  calculateForearmLength,
  calculateFullArmLength,
  calculateThighLength,
  calculateShinLength,
  calculateTorsoLength,
  // Widths
  calculateShoulderWidth,
  calculateHipWidth,
  calculateStanceWidth,
  // Ratios
  calculateDistanceRatio,
  calculateArmExtension,
  // Normalization
  estimateScaleFactor,
  normalizedToReal,
  // Constants
  DISTANCE_EPSILON,
  MIN_VISIBILITY,
} from './distanceUtils'

// Velocity Utilities
export {
  // Types
  type VelocityResult,
  type SpeedResult,
  // Frame-to-frame velocity
  calculateVelocity,
  calculateSpeed,
  // Directional velocities
  calculateVerticalVelocity,
  calculateVerticalVelocityPhysics,
  calculateHorizontalVelocity,
  // Acceleration
  calculateAcceleration,
  // Multi-frame velocity
  calculateAverageVelocity,
  calculatePeakVelocity,
  // Unit conversion
  velocityToReal,
  cmPerSecToMPerSec,
  // Constants
  DEFAULT_FPS,
  VELOCITY_EPSILON,
  VELOCITY_MIN_VISIBILITY,
} from './velocityUtils'

// Jump Utilities
export {
  // Types
  type JumpAnalysis,
  type HipCenterResult,
  // Hip center
  calculateHipCenter,
  getHipCenterFromFrame,
  // Jump height
  estimateJumpHeight,
  findPeakJumpFrame,
  findBaselineFrame,
  // Full analysis
  analyzeJump,
  // Unit conversion
  jumpHeightToCm,
  estimateScaleFactorFromHeight,
  // Constants
  JUMP_MIN_VISIBILITY,
} from './jumpUtils'