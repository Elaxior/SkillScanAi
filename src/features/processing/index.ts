/**
 * Processing Feature Index
 * 
 * Frame processing and keyframe detection utilities
 */

// Smoothing
export {
  movingAverage,
  weightedMovingAverage,
  smoothLandmarkFrames,
  calculateSmoothedVelocity,
  calculateAcceleration,
  DEFAULT_SMOOTHING_CONFIG,
} from './smoothingUtils'
export type { SmoothingConfig } from './smoothingUtils'

// Frame Processing
export {
  processLandmarkFrames,
  validateFrames,
  calculateFPS,
  calculateFPSFromTimestamps,
  extractHipCenterY,
  extractWristY,
  extractShoulderY,
  DEFAULT_PROCESSING_CONFIG,
} from './frameProcessor'
export type {
  ProcessedFrameData,
  ProcessingMetadata,
  ProcessingConfig,
} from './frameProcessor'

// Keyframe Detection
export {
  detectKeyframes,
  detectPeakJumpFrame,
  detectReleaseFrame,
  detectStartFrame,
  detectEndFrame,
  validateKeyframes,
  DEFAULT_KEYFRAME_CONFIG,
} from './keyframeUtils'
export type {
  Keyframes,
  KeyframeDetectionResult,
  KeyframeConfig,
} from './keyframeUtils'