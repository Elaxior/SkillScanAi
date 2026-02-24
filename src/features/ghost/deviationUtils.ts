/**
 * Deviation Calculation Utilities
 * 
 * These functions calculate the difference between user pose
 * and ideal pose, identifying which joints need correction.
 * 
 * Why small threshold prevents over-highlighting:
 * - Minor pose estimation noise is normal (2-3% of frame)
 * - Highlighting everything would be overwhelming and unhelpful
 * - Only significant deviations (>5%) indicate real form issues
 * - This keeps the UI clean and feedback actionable
 */

import type { NormalizedLandmark } from '@mediapipe/pose';
import type { JointDeviation, FrameDeviation, NormalizedPoint } from './types';
import { KEY_FORM_JOINTS, JOINT_NAMES } from './ideaBasketballPose';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default threshold for significant deviation
 * 0.05 = 5% of frame dimension
 * 
 * This threshold was chosen because:
 * - MediaPipe has ~2-3% natural jitter
 * - 5% deviation is visible but not noise
 * - Keeps highlighting meaningful
 */
export const DEFAULT_DEVIATION_THRESHOLD = 0.05;

/**
 * Minimum visibility to consider a joint valid
 */
const MIN_VISIBILITY = 0.5;

/**
 * Weight multipliers for different joints
 * Higher weight = more important for form analysis
 */
const JOINT_WEIGHTS: Record<number, number> = {
  14: 1.5,  // Right elbow (shooting arm) - most important
  16: 1.5,  // Right wrist (release point) - most important
  12: 1.2,  // Right shoulder
  25: 1.0,  // Left knee
  26: 1.0,  // Right knee
  // All others default to 1.0
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Calculate Euclidean distance between two normalized points
 * 
 * @param p1 - First point
 * @param p2 - Second point
 * @returns Distance (0 to ~1.414 for diagonal of unit square)
 */
export function calculatePointDistance(
  p1: NormalizedPoint,
  p2: NormalizedPoint
): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate deviation for a single joint
 * 
 * @param userPoint - User's landmark position
 * @param idealPoint - Ideal landmark position
 * @param index - Landmark index
 * @param threshold - Threshold for significant deviation
 * @returns Joint deviation information
 */
export function calculateJointDeviation(
  userPoint: NormalizedLandmark | null,
  idealPoint: NormalizedLandmark | null,
  index: number,
  threshold: number = DEFAULT_DEVIATION_THRESHOLD
): JointDeviation | null {
  // Skip if either point is missing or low visibility
  if (!userPoint || !idealPoint) {
    return null;
  }

  if ((userPoint.visibility ?? 1) < MIN_VISIBILITY) {
    return null;
  }

  const distance = calculatePointDistance(userPoint, idealPoint);
  const weight = JOINT_WEIGHTS[index] ?? 1.0;
  const weightedDistance = distance * weight;

  return {
    index,
    name: JOINT_NAMES[index] || `Joint ${index}`,
    distance: weightedDistance,
    isSignificant: weightedDistance > threshold,
    userPoint: {
      x: userPoint.x,
      y: userPoint.y,
      z: userPoint.z,
      visibility: userPoint.visibility,
    },
    idealPoint: {
      x: idealPoint.x,
      y: idealPoint.y,
      z: idealPoint.z,
      visibility: idealPoint.visibility,
    },
  };
}

/**
 * Calculate deviations for an entire frame
 * 
 * @param userFrame - User's landmarks for this frame
 * @param idealFrame - Ideal pose landmarks
 * @param threshold - Threshold for significant deviation
 * @param keyJointsOnly - Only analyze key form joints
 * @returns Complete frame deviation analysis
 */
export function calculateFrameDeviation(
  userFrame: NormalizedLandmark[],
  idealFrame: NormalizedLandmark[],
  threshold: number = DEFAULT_DEVIATION_THRESHOLD,
  keyJointsOnly: boolean = true
): FrameDeviation {
  const jointsToAnalyze = keyJointsOnly ? KEY_FORM_JOINTS :
    Array.from({ length: 33 }, (_, i) => i);

  const allJoints: JointDeviation[] = [];
  let totalDeviation = 0;
  let maxDeviation = 0;
  let validJointCount = 0;

  for (const index of jointsToAnalyze) {
    const deviation = calculateJointDeviation(
      userFrame[index],
      idealFrame[index],
      index,
      threshold
    );

    if (deviation) {
      allJoints.push(deviation);
      totalDeviation += deviation.distance;
      maxDeviation = Math.max(maxDeviation, deviation.distance);
      validJointCount++;
    }
  }

  const averageDeviation = validJointCount > 0
    ? totalDeviation / validJointCount
    : 0;

  const significantJoints = allJoints.filter((j) => j.isSignificant);

  // Calculate alignment score (inverse of deviation)
  // Perfect alignment = 100, higher deviation = lower score
  const maxPossibleDeviation = 0.3; // Reasonable max deviation
  const normalizedDeviation = Math.min(averageDeviation / maxPossibleDeviation, 1);
  const alignmentScore = Math.round((1 - normalizedDeviation) * 100);

  return {
    averageDeviation,
    maxDeviation,
    significantJoints,
    allJoints,
    alignmentScore: Math.max(0, Math.min(100, alignmentScore)),
  };
}

/**
 * Get the joints with major deviations for highlighting
 * 
 * @param frameDeviation - Pre-calculated frame deviation
 * @param maxHighlights - Maximum number of joints to highlight
 * @returns Array of joint indices to highlight
 */
export function getMajorDeviationJoints(
  frameDeviation: FrameDeviation,
  maxHighlights: number = 5
): number[] {
  // Sort by deviation distance (descending) and take top N
  return frameDeviation.significantJoints
    .sort((a, b) => b.distance - a.distance)
    .slice(0, maxHighlights)
    .map((j) => j.index);
}

/**
 * Calculate alignment percentage for a specific body region
 */
export function getRegionAlignment(
  frameDeviation: FrameDeviation,
  region: 'upper' | 'lower' | 'arms'
): number {
  const regionJoints: Record<string, number[]> = {
    upper: [11, 12, 13, 14, 15, 16], // Shoulders, elbows, wrists
    lower: [23, 24, 25, 26, 27, 28], // Hips, knees, ankles
    arms: [13, 14, 15, 16],          // Elbows, wrists only
  };

  const indices = regionJoints[region] || [];
  const regionJointDeviations = frameDeviation.allJoints.filter(
    (j) => indices.includes(j.index)
  );

  if (regionJointDeviations.length === 0) return 100;

  const avgDeviation = regionJointDeviations.reduce(
    (sum, j) => sum + j.distance, 0
  ) / regionJointDeviations.length;

  const maxPossibleDeviation = 0.3;
  const normalizedDeviation = Math.min(avgDeviation / maxPossibleDeviation, 1);

  return Math.round((1 - normalizedDeviation) * 100);
}

/**
 * Format deviation for display
 */
export function formatDeviation(deviation: number): string {
  const percentage = (deviation * 100).toFixed(1);
  return `${percentage}%`;
}

/**
 * Get severity level for a deviation
 */
export function getDeviationSeverity(
  deviation: number
): 'none' | 'low' | 'medium' | 'high' {
  if (deviation < 0.03) return 'none';
  if (deviation < 0.07) return 'low';
  if (deviation < 0.12) return 'medium';
  return 'high';
}