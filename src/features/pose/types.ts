/**
 * Pose Detection Types
 * 
 * Type definitions for MediaPipe Pose landmarks and processing.
 */

// ==========================================
// LANDMARK TYPES
// ==========================================

/**
 * Single landmark point from MediaPipe
 * Coordinates are normalized (0-1) relative to image dimensions
 */
export interface NormalizedLandmark {
  /** X coordinate (0-1, left to right) */
  x: number
  /** Y coordinate (0-1, top to bottom) */
  y: number
  /** Z coordinate (depth, relative to hips) */
  z: number
  /** Visibility score (0-1, how visible the point is) */
  visibility?: number
}

/**
 * Landmark with pixel coordinates (for drawing)
 */
export interface PixelLandmark {
  x: number
  y: number
  z: number
  visibility?: number
}

/**
 * Frame data containing landmarks for a single video frame
 */
export interface PoseFrame {
  /** Frame number in video */
  frameNumber: number
  /** Timestamp in video (seconds) */
  timestamp: number
  /** All 33 pose landmarks */
  landmarks: NormalizedLandmark[]
  /** Average visibility/confidence of all landmarks */
  confidence: number
}

/**
 * Complete pose detection result for entire video
 */
export interface PoseDetectionResult {
  /** All frames with detected poses */
  frames: PoseFrame[]
  /** Total frames processed */
  totalFrames: number
  /** Frames with valid pose detected */
  framesWithPose: number
  /** Detection rate (framesWithPose / totalFrames) */
  detectionRate: number
  /** Video duration in seconds */
  videoDuration: number
  /** Processing time in milliseconds */
  processingTime: number
}

// ==========================================
// LANDMARK INDEX ENUM
// ==========================================

/**
 * MediaPipe Pose landmark indices
 * Use these for accessing specific body parts
 */
export enum LandmarkIndex {
  NOSE = 0,
  LEFT_EYE_INNER = 1,
  LEFT_EYE = 2,
  LEFT_EYE_OUTER = 3,
  RIGHT_EYE_INNER = 4,
  RIGHT_EYE = 5,
  RIGHT_EYE_OUTER = 6,
  LEFT_EAR = 7,
  RIGHT_EAR = 8,
  MOUTH_LEFT = 9,
  MOUTH_RIGHT = 10,
  LEFT_SHOULDER = 11,
  RIGHT_SHOULDER = 12,
  LEFT_ELBOW = 13,
  RIGHT_ELBOW = 14,
  LEFT_WRIST = 15,
  RIGHT_WRIST = 16,
  LEFT_PINKY = 17,
  RIGHT_PINKY = 18,
  LEFT_INDEX = 19,
  RIGHT_INDEX = 20,
  LEFT_THUMB = 21,
  RIGHT_THUMB = 22,
  LEFT_HIP = 23,
  RIGHT_HIP = 24,
  LEFT_KNEE = 25,
  RIGHT_KNEE = 26,
  LEFT_ANKLE = 27,
  RIGHT_ANKLE = 28,
  LEFT_HEEL = 29,
  RIGHT_HEEL = 30,
  LEFT_FOOT_INDEX = 31,
  RIGHT_FOOT_INDEX = 32,
}

/**
 * Landmark names for display
 */
export const LANDMARK_NAMES: Record<LandmarkIndex, string> = {
  [LandmarkIndex.NOSE]: 'Nose',
  [LandmarkIndex.LEFT_EYE_INNER]: 'Left Eye Inner',
  [LandmarkIndex.LEFT_EYE]: 'Left Eye',
  [LandmarkIndex.LEFT_EYE_OUTER]: 'Left Eye Outer',
  [LandmarkIndex.RIGHT_EYE_INNER]: 'Right Eye Inner',
  [LandmarkIndex.RIGHT_EYE]: 'Right Eye',
  [LandmarkIndex.RIGHT_EYE_OUTER]: 'Right Eye Outer',
  [LandmarkIndex.LEFT_EAR]: 'Left Ear',
  [LandmarkIndex.RIGHT_EAR]: 'Right Ear',
  [LandmarkIndex.MOUTH_LEFT]: 'Mouth Left',
  [LandmarkIndex.MOUTH_RIGHT]: 'Mouth Right',
  [LandmarkIndex.LEFT_SHOULDER]: 'Left Shoulder',
  [LandmarkIndex.RIGHT_SHOULDER]: 'Right Shoulder',
  [LandmarkIndex.LEFT_ELBOW]: 'Left Elbow',
  [LandmarkIndex.RIGHT_ELBOW]: 'Right Elbow',
  [LandmarkIndex.LEFT_WRIST]: 'Left Wrist',
  [LandmarkIndex.RIGHT_WRIST]: 'Right Wrist',
  [LandmarkIndex.LEFT_PINKY]: 'Left Pinky',
  [LandmarkIndex.RIGHT_PINKY]: 'Right Pinky',
  [LandmarkIndex.LEFT_INDEX]: 'Left Index',
  [LandmarkIndex.RIGHT_INDEX]: 'Right Index',
  [LandmarkIndex.LEFT_THUMB]: 'Left Thumb',
  [LandmarkIndex.RIGHT_THUMB]: 'Right Thumb',
  [LandmarkIndex.LEFT_HIP]: 'Left Hip',
  [LandmarkIndex.RIGHT_HIP]: 'Right Hip',
  [LandmarkIndex.LEFT_KNEE]: 'Left Knee',
  [LandmarkIndex.RIGHT_KNEE]: 'Right Knee',
  [LandmarkIndex.LEFT_ANKLE]: 'Left Ankle',
  [LandmarkIndex.RIGHT_ANKLE]: 'Right Ankle',
  [LandmarkIndex.LEFT_HEEL]: 'Left Heel',
  [LandmarkIndex.RIGHT_HEEL]: 'Right Heel',
  [LandmarkIndex.LEFT_FOOT_INDEX]: 'Left Foot',
  [LandmarkIndex.RIGHT_FOOT_INDEX]: 'Right Foot',
}

// ==========================================
// KEY LANDMARKS FOR SPORTS
// ==========================================

/**
 * Key landmark indices for sports analysis
 * These are the most important points for movement analysis
 */
export const KEY_LANDMARKS = {
  /** Core body landmarks */
  CORE: [
    LandmarkIndex.LEFT_SHOULDER,
    LandmarkIndex.RIGHT_SHOULDER,
    LandmarkIndex.LEFT_HIP,
    LandmarkIndex.RIGHT_HIP,
  ],
  
  /** Upper body landmarks */
  UPPER_BODY: [
    LandmarkIndex.LEFT_SHOULDER,
    LandmarkIndex.RIGHT_SHOULDER,
    LandmarkIndex.LEFT_ELBOW,
    LandmarkIndex.RIGHT_ELBOW,
    LandmarkIndex.LEFT_WRIST,
    LandmarkIndex.RIGHT_WRIST,
  ],
  
  /** Lower body landmarks */
  LOWER_BODY: [
    LandmarkIndex.LEFT_HIP,
    LandmarkIndex.RIGHT_HIP,
    LandmarkIndex.LEFT_KNEE,
    LandmarkIndex.RIGHT_KNEE,
    LandmarkIndex.LEFT_ANKLE,
    LandmarkIndex.RIGHT_ANKLE,
  ],
  
  /** All key landmarks for full body */
  ALL_KEY: [
    LandmarkIndex.NOSE,
    LandmarkIndex.LEFT_SHOULDER,
    LandmarkIndex.RIGHT_SHOULDER,
    LandmarkIndex.LEFT_ELBOW,
    LandmarkIndex.RIGHT_ELBOW,
    LandmarkIndex.LEFT_WRIST,
    LandmarkIndex.RIGHT_WRIST,
    LandmarkIndex.LEFT_HIP,
    LandmarkIndex.RIGHT_HIP,
    LandmarkIndex.LEFT_KNEE,
    LandmarkIndex.RIGHT_KNEE,
    LandmarkIndex.LEFT_ANKLE,
    LandmarkIndex.RIGHT_ANKLE,
  ],
} as const

// ==========================================
// PROCESSING STATE TYPES
// ==========================================

/**
 * Processing status
 */
export type ProcessingStatus = 
  | 'idle'
  | 'initializing'
  | 'loading-model'
  | 'processing'
  | 'completed'
  | 'error'

/**
 * Processing progress
 */
export interface ProcessingProgress {
  /** Current status */
  status: ProcessingStatus
  /** Current frame being processed */
  currentFrame: number
  /** Total frames to process */
  totalFrames: number
  /** Progress percentage (0-100) */
  percentage: number
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining: number | null
  /** Error message if status is 'error' */
  error: string | null
}