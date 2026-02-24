/**
 * Ideal Basketball Poses
 * 
 * Hardcoded landmark arrays representing biomechanically optimal form
 * for various basketball actions. These are based on sports science
 * research and analysis of professional shooters.
 * 
 * Coordinate System:
 * - X: 0 (left) to 1 (right)
 * - Y: 0 (top) to 1 (bottom)
 * - Z: Depth (optional, used for 3D if available)
 * 
 * Why static ideal pose is sufficient for MVP:
 * 1. Captures biomechanical best practices without licensing costs
 * 2. Consistent reference point for all users
 * 3. Can be tuned based on coaching feedback
 * 4. Upgrade path to real pro data later
 */

import type { NormalizedLandmark } from '@mediapipe/pose';
import { LandmarkIndex } from '@/features/pose/types';

/**
 * MediaPipe landmark indices for reference:
 * 
 * 0: nose
 * 11: left_shoulder, 12: right_shoulder
 * 13: left_elbow, 14: right_elbow
 * 15: left_wrist, 16: right_wrist
 * 23: left_hip, 24: right_hip
 * 25: left_knee, 26: right_knee
 * 27: left_ankle, 28: right_ankle
 */

/**
 * Creates a normalized landmark with default visibility
 */
function createLandmark(
  x: number,
  y: number,
  z: number = 0,
  visibility: number = 1.0
): NormalizedLandmark {
  return { x, y, z, visibility };
}

/**
 * Ideal Basketball Jump Shot - Release Frame
 * 
 * This represents the optimal body position at the moment of ball release.
 * Key characteristics:
 * - Shooting arm (right) fully extended upward
 * - Elbow at ~165° (near full extension)
 * - Wrist above head height (high release point)
 * - Guide hand (left) relaxed to the side
 * - Body upright and balanced
 * - Legs extended from jump
 * 
 * Based on analysis of:
 * - Stephen Curry's shooting form
 * - Klay Thompson's shooting form
 * - Sports biomechanics research on optimal release angles
 */
export const IDEAL_JUMPSHOT_RELEASE: NormalizedLandmark[] = [
  // Face landmarks (0-10) - simplified, not critical for form analysis
  createLandmark(0.50, 0.18, 0),    // 0: nose
  createLandmark(0.48, 0.15, 0),    // 1: left_eye_inner
  createLandmark(0.47, 0.15, 0),    // 2: left_eye
  createLandmark(0.46, 0.15, 0),    // 3: left_eye_outer
  createLandmark(0.52, 0.15, 0),    // 4: right_eye_inner
  createLandmark(0.53, 0.15, 0),    // 5: right_eye
  createLandmark(0.54, 0.15, 0),    // 6: right_eye_outer
  createLandmark(0.45, 0.16, 0),    // 7: left_ear
  createLandmark(0.55, 0.16, 0),    // 8: right_ear
  createLandmark(0.49, 0.21, 0),    // 9: mouth_left
  createLandmark(0.51, 0.21, 0),    // 10: mouth_right
  
  // Upper body - CRITICAL for shooting form
  createLandmark(0.42, 0.30, 0),    // 11: left_shoulder (guide side)
  createLandmark(0.58, 0.30, 0),    // 12: right_shoulder (shooting side)
  createLandmark(0.38, 0.38, 0),    // 13: left_elbow (relaxed, guide hand)
  createLandmark(0.56, 0.18, 0),    // 14: right_elbow (shooting arm, high)
  createLandmark(0.35, 0.42, 0),    // 15: left_wrist (guide hand relaxed)
  createLandmark(0.54, 0.08, 0),    // 16: right_wrist (release point - HIGH)
  
  // Hands (17-22) - less critical
  createLandmark(0.34, 0.43, 0),    // 17: left_pinky
  createLandmark(0.33, 0.42, 0),    // 18: left_index
  createLandmark(0.33, 0.43, 0),    // 19: left_thumb
  createLandmark(0.53, 0.06, 0),    // 20: right_pinky (follow through position)
  createLandmark(0.55, 0.06, 0),    // 21: right_index
  createLandmark(0.54, 0.07, 0),    // 22: right_thumb
  
  // Lower body - important for base/stability
  createLandmark(0.45, 0.52, 0),    // 23: left_hip
  createLandmark(0.55, 0.52, 0),    // 24: right_hip
  createLandmark(0.44, 0.70, 0),    // 25: left_knee (extended)
  createLandmark(0.56, 0.70, 0),    // 26: right_knee (extended)
  createLandmark(0.43, 0.88, 0),    // 27: left_ankle
  createLandmark(0.57, 0.88, 0),    // 28: right_ankle
  
  // Feet (29-32) - less critical
  createLandmark(0.42, 0.92, 0),    // 29: left_heel
  createLandmark(0.41, 0.90, 0),    // 30: left_foot_index
  createLandmark(0.58, 0.92, 0),    // 31: right_heel
  createLandmark(0.59, 0.90, 0),    // 32: right_foot_index
];

/**
 * Ideal Basketball Free Throw - Release Frame
 * 
 * Similar to jump shot but with less vertical displacement
 * and more emphasis on rhythm and consistency.
 */
export const IDEAL_FREETHROW_RELEASE: NormalizedLandmark[] = [
  // Face landmarks (0-10)
  createLandmark(0.50, 0.20, 0),    // 0: nose
  createLandmark(0.48, 0.17, 0),    // 1: left_eye_inner
  createLandmark(0.47, 0.17, 0),    // 2: left_eye
  createLandmark(0.46, 0.17, 0),    // 3: left_eye_outer
  createLandmark(0.52, 0.17, 0),    // 4: right_eye_inner
  createLandmark(0.53, 0.17, 0),    // 5: right_eye
  createLandmark(0.54, 0.17, 0),    // 6: right_eye_outer
  createLandmark(0.45, 0.18, 0),    // 7: left_ear
  createLandmark(0.55, 0.18, 0),    // 8: right_ear
  createLandmark(0.49, 0.23, 0),    // 9: mouth_left
  createLandmark(0.51, 0.23, 0),    // 10: mouth_right
  
  // Upper body
  createLandmark(0.42, 0.32, 0),    // 11: left_shoulder
  createLandmark(0.58, 0.32, 0),    // 12: right_shoulder
  createLandmark(0.38, 0.40, 0),    // 13: left_elbow
  createLandmark(0.57, 0.22, 0),    // 14: right_elbow (shooting arm)
  createLandmark(0.36, 0.44, 0),    // 15: left_wrist
  createLandmark(0.55, 0.12, 0),    // 16: right_wrist (release)
  
  // Hands (17-22)
  createLandmark(0.35, 0.45, 0),    // 17: left_pinky
  createLandmark(0.34, 0.44, 0),    // 18: left_index
  createLandmark(0.34, 0.45, 0),    // 19: left_thumb
  createLandmark(0.54, 0.10, 0),    // 20: right_pinky
  createLandmark(0.56, 0.10, 0),    // 21: right_index
  createLandmark(0.55, 0.11, 0),    // 22: right_thumb
  
  // Lower body - more grounded than jump shot
  createLandmark(0.45, 0.55, 0),    // 23: left_hip
  createLandmark(0.55, 0.55, 0),    // 24: right_hip
  createLandmark(0.44, 0.75, 0),    // 25: left_knee (slight bend)
  createLandmark(0.56, 0.75, 0),    // 26: right_knee
  createLandmark(0.43, 0.95, 0),    // 27: left_ankle
  createLandmark(0.57, 0.95, 0),    // 28: right_ankle
  
  // Feet (29-32)
  createLandmark(0.42, 0.98, 0),    // 29: left_heel
  createLandmark(0.41, 0.96, 0),    // 30: left_foot_index
  createLandmark(0.58, 0.98, 0),    // 31: right_heel
  createLandmark(0.59, 0.96, 0),    // 32: right_foot_index
];

/**
 * Joint names for display
 */
export const JOINT_NAMES: Record<number, string> = {
  [LandmarkIndex.NOSE]: 'Head',
  [LandmarkIndex.LEFT_SHOULDER]: 'Left Shoulder',
  [LandmarkIndex.RIGHT_SHOULDER]: 'Right Shoulder',
  [LandmarkIndex.LEFT_ELBOW]: 'Left Elbow',
  [LandmarkIndex.RIGHT_ELBOW]: 'Right Elbow',
  [LandmarkIndex.LEFT_WRIST]: 'Left Wrist',
  [LandmarkIndex.RIGHT_WRIST]: 'Right Wrist',
  [LandmarkIndex.LEFT_HIP]: 'Left Hip',
  [LandmarkIndex.RIGHT_HIP]: 'Right Hip',
  [LandmarkIndex.LEFT_KNEE]: 'Left Knee',
  [LandmarkIndex.RIGHT_KNEE]: 'Right Knee',
  [LandmarkIndex.LEFT_ANKLE]: 'Left Ankle',
  [LandmarkIndex.RIGHT_ANKLE]: 'Right Ankle',
};

/**
 * Key joints for form analysis (joints we care about for deviation)
 * These are the joints most important for shooting form
 */
export const KEY_FORM_JOINTS: number[] = [
  LandmarkIndex.RIGHT_SHOULDER,  // Shooting shoulder
  LandmarkIndex.RIGHT_ELBOW,     // Shooting elbow - critical
  LandmarkIndex.RIGHT_WRIST,     // Release point - critical
  LandmarkIndex.LEFT_SHOULDER,   // Guide shoulder
  LandmarkIndex.LEFT_ELBOW,      // Guide elbow
  LandmarkIndex.LEFT_WRIST,      // Guide hand
  LandmarkIndex.RIGHT_HIP,       // Base stability
  LandmarkIndex.LEFT_HIP,        // Base stability
  LandmarkIndex.RIGHT_KNEE,      // Leg drive
  LandmarkIndex.LEFT_KNEE,       // Leg drive
];

/**
 * Get ideal pose for a specific basketball action
 */
export function getIdealBasketballPose(
  action: string
): NormalizedLandmark[] | null {
  switch (action) {
    case 'jump_shot':
      return IDEAL_JUMPSHOT_RELEASE;
    case 'free_throw':
      return IDEAL_FREETHROW_RELEASE;
    default:
      // Fall back to jump shot for unknown actions
      return IDEAL_JUMPSHOT_RELEASE;
  }
}

/**
 * Get ideal pose for any sport/action combination
 */
export function getIdealPose(
  sport: string,
  action: string
): NormalizedLandmark[] | null {
  if (sport === 'basketball') {
    return getIdealBasketballPose(action);
  }
  
  // TODO: Add other sports
  // For now, return null for unsupported sports
  return null;
}