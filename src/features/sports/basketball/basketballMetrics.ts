/**
 * Basketball Metric Calculator
 * 
 * This module calculates sport-specific metrics for basketball actions,
 * currently implementing the jump shot with full metric extraction.
 * 
 * Architecture:
 * - Pure functions for each metric calculation
 * - Uses biomechanics utilities from Part 9
 * - Defensive programming throughout
 * - All metrics nullable for graceful degradation
 */

import type { NormalizedLandmark } from '@mediapipe/pose';
import {
  calculateElbowAngle,
  calculateKneeAngle,
  analyzeJump,
  calculateHorizontalDistance,
} from '@/features/biomechanics';
import { LandmarkIndex } from '@/features/pose/types';
import type { MetricCalculationInput, MetricResult } from '../types';
import type { BasketballJumpShotMetrics, BasketballAction } from './basketballTypes';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Minimum confidence threshold for landmark validity
 * Landmarks below this threshold are considered unreliable
 */
const MIN_LANDMARK_CONFIDENCE = 0.5;

/**
 * Maximum allowed horizontal displacement (as fraction of body width)
 * for stability calculation normalization
 */
const MAX_STABILITY_DISPLACEMENT = 0.8;

/**
 * Number of frames to analyze after release for follow-through
 */
const FOLLOW_THROUGH_FRAMES = 15;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safely retrieves a landmark from a frame with validation
 * 
 * @param frame - Array of 33 landmarks for a single frame
 * @param index - Landmark index to retrieve
 * @returns The landmark if valid, null otherwise
 */
function getLandmark(
  frame: NormalizedLandmark[] | undefined,
  index: LandmarkIndex
): NormalizedLandmark | null {
  if (!frame || !Array.isArray(frame)) return null;

  const landmark = frame[index];
  if (!landmark) return null;

  // Check visibility/confidence if available
  const visibility = landmark.visibility ?? 1;
  if (visibility < MIN_LANDMARK_CONFIDENCE) return null;

  // Validate coordinates are within normalized range
  if (
    typeof landmark.x !== 'number' ||
    typeof landmark.y !== 'number' ||
    isNaN(landmark.x) ||
    isNaN(landmark.y)
  ) {
    return null;
  }

  return landmark;
}

/**
 * Determines which side (left/right) is the shooting hand
 * Based on which wrist is higher at the release frame
 * 
 * @param frame - The release frame
 * @returns 'left' or 'right' indicating shooting hand
 */
function detectShootingHand(frame: NormalizedLandmark[]): 'left' | 'right' {
  const leftWrist = getLandmark(frame, LandmarkIndex.LEFT_WRIST);
  const rightWrist = getLandmark(frame, LandmarkIndex.RIGHT_WRIST);

  if (!leftWrist && !rightWrist) return 'right'; // Default to right
  if (!leftWrist) return 'right';
  if (!rightWrist) return 'left';

  // In image coordinates, lower Y = higher position
  return leftWrist.y < rightWrist.y ? 'left' : 'right';
}

/**
 * Gets the appropriate landmark indices for the shooting side
 */
function getShootingSideLandmarks(side: 'left' | 'right') {
  if (side === 'left') {
    return {
      shoulder: LandmarkIndex.LEFT_SHOULDER,
      elbow: LandmarkIndex.LEFT_ELBOW,
      wrist: LandmarkIndex.LEFT_WRIST,
      hip: LandmarkIndex.LEFT_HIP,
      knee: LandmarkIndex.LEFT_KNEE,
      ankle: LandmarkIndex.LEFT_ANKLE,
    };
  }
  return {
    shoulder: LandmarkIndex.RIGHT_SHOULDER,
    elbow: LandmarkIndex.RIGHT_ELBOW,
    wrist: LandmarkIndex.RIGHT_WRIST,
    hip: LandmarkIndex.RIGHT_HIP,
    knee: LandmarkIndex.RIGHT_KNEE,
    ankle: LandmarkIndex.RIGHT_ANKLE,
  };
}

// ============================================================================
// METRIC CALCULATORS
// ============================================================================

/**
 * Calculates the release angle relative to horizontal
 * 
 * Mathematical basis:
 * The wrist-elbow vector approximates the initial ball trajectory because:
 * 1. At release, the forearm is aligned with the push direction
 * 2. The ball leaves the hand tangent to the arc of wrist motion
 * 3. This vector provides a consistent, measurable proxy for release angle
 * 
 * @param wrist - Wrist landmark position
 * @param elbow - Elbow landmark position
 * @returns Release angle in degrees (0-90), null if invalid
 */
function calculateReleaseAngle(
  wrist: NormalizedLandmark | null,
  elbow: NormalizedLandmark | null
): number | null {
  if (!wrist || !elbow) return null;

  // Vector from elbow to wrist (shooting direction)
  const dx = wrist.x - elbow.x;
  const dy = wrist.y - elbow.y;

  // In normalized image coordinates:
  // - X increases left to right
  // - Y increases top to bottom
  // We negate dy because "up" in real world is negative Y in image coords
  // Use abs(dx) so left-handed / mirrored shots give same angle
  const angleRad = Math.atan2(-dy, Math.abs(dx));
  let angleDeg = angleRad * (180 / Math.PI);

  // atan2 with non-negative second arg returns [-90, +90].
  // After abs, range is [0, 90]. 90 means perfectly vertical (frontal camera) — valid.
  angleDeg = Math.abs(angleDeg);

  if (isNaN(angleDeg)) return null;

  // Clamp to valid physical range [0, 90]
  angleDeg = Math.max(0, Math.min(90, angleDeg));

  return Math.round(angleDeg * 10) / 10;
}

/**
 * Calculates the internal elbow angle at release
 * 
 * Uses the shoulder-elbow-wrist triangle to compute the angle
 * at the elbow vertex.
 * 
 * @param frame - Release frame landmarks
 * @param landmarks - Shooting side landmark indices
 * @returns Elbow angle in degrees (0-180), null if invalid
 */
function calculateElbowAngleAtRelease(
  frame: NormalizedLandmark[],
  landmarks: ReturnType<typeof getShootingSideLandmarks>
): number | null {
  const shoulder = getLandmark(frame, landmarks.shoulder);
  const elbow = getLandmark(frame, landmarks.elbow);
  const wrist = getLandmark(frame, landmarks.wrist);

  if (!shoulder || !elbow || !wrist) return null;

  const result = calculateElbowAngle(shoulder, elbow, wrist);

  if (!result.isValid || isNaN(result.degrees)) return null;

  return Math.round(result.degrees * 10) / 10;
}

/**
 * Calculates knee angle at peak jump
 * 
 * Full leg extension (180°) at peak indicates proper power transfer.
 * Bent knees at peak suggest incomplete leg drive.
 * 
 * @param frame - Peak jump frame landmarks
 * @param landmarks - Landmark indices to use
 * @returns Knee angle in degrees (0-180), null if invalid
 */
function calculateKneeAngleAtPeak(
  frame: NormalizedLandmark[],
  landmarks: ReturnType<typeof getShootingSideLandmarks>
): number | null {
  const hip = getLandmark(frame, landmarks.hip);
  const knee = getLandmark(frame, landmarks.knee);
  const ankle = getLandmark(frame, landmarks.ankle);

  if (!hip || !knee || !ankle) return null;

  const result = calculateKneeAngle(hip, knee, ankle);

  if (!result.isValid || isNaN(result.degrees)) return null;

  return Math.round(result.degrees * 10) / 10;
}

/**
 * Calculates shot stability index
 * 
 * Why stability matters:
 * - Lateral body movement during a shot introduces horizontal velocity
 * - This requires the shooter to compensate with aim adjustments
 * - Consistent shooters minimize this lateral drift
 * - Exception: Fadeaway shots intentionally introduce drift
 * 
 * Calculation:
 * 1. Measure hip center horizontal position at start frame
 * 2. Measure hip center horizontal position at release frame
 * 3. Calculate displacement as fraction of body width
 * 4. Convert to 0-100 stability score (inverse relationship)
 * 
 * @param frames - All smoothed frames
 * @param startFrame - Frame index of shot initiation
 * @param releaseFrame - Frame index of release
 * @returns Stability index 0-100, null if invalid
 */
function calculateStabilityIndex(
  frames: NormalizedLandmark[][],
  startFrame: number | null,
  releaseFrame: number | null
): number | null {
  if (startFrame === null || releaseFrame === null) return null;
  if (startFrame < 0 || releaseFrame >= frames.length) return null;
  if (startFrame >= releaseFrame) return null;

  const startFrameData = frames[startFrame];
  const releaseFrameData = frames[releaseFrame];

  if (!startFrameData || !releaseFrameData) return null;

  // Get hip landmarks for center of mass approximation
  const startLeftHip = getLandmark(startFrameData, LandmarkIndex.LEFT_HIP);
  const startRightHip = getLandmark(startFrameData, LandmarkIndex.RIGHT_HIP);
  const releaseLeftHip = getLandmark(releaseFrameData, LandmarkIndex.LEFT_HIP);
  const releaseRightHip = getLandmark(releaseFrameData, LandmarkIndex.RIGHT_HIP);

  if (!startLeftHip || !startRightHip || !releaseLeftHip || !releaseRightHip) {
    return null;
  }

  // Calculate hip center at each frame
  const startHipCenterX = (startLeftHip.x + startRightHip.x) / 2;
  const releaseHipCenterX = (releaseLeftHip.x + releaseRightHip.x) / 2;

  // Calculate body width for normalization
  const startShoulderL = getLandmark(startFrameData, LandmarkIndex.LEFT_SHOULDER);
  const startShoulderR = getLandmark(startFrameData, LandmarkIndex.RIGHT_SHOULDER);

  let bodyWidth = 0.2; // Default fallback (20% of frame width)
  if (startShoulderL && startShoulderR) {
    bodyWidth = Math.abs(startShoulderR.x - startShoulderL.x);
    bodyWidth = Math.max(bodyWidth, 0.05); // Minimum to avoid division issues
  }

  // Calculate horizontal displacement
  const displacement = Math.abs(releaseHipCenterX - startHipCenterX);

  // Normalize displacement relative to body width
  const normalizedDisplacement = displacement / bodyWidth;

  // Convert to stability score (0-100)
  // 0 displacement = 100 stability
  // MAX_STABILITY_DISPLACEMENT or more = 0 stability
  const stabilityRaw = 1 - (normalizedDisplacement / MAX_STABILITY_DISPLACEMENT);
  const stabilityClamped = Math.max(0, Math.min(1, stabilityRaw));
  const stabilityScore = Math.round(stabilityClamped * 100);

  return stabilityScore;
}

/**
 * Calculates jump height using biomechanics utility
 * 
 * @param frames - All smoothed frames
 * @param fps - Video frames per second
 * @param keyframes - Detected keyframe indices
 * @returns Normalized jump height (0-1), null if invalid
 */
function calculateJumpHeightNormalized(
  frames: NormalizedLandmark[][],
  fps: number,
  keyframes: MetricCalculationInput['keyframes']
): number | null {
  if (!keyframes.peakJump || !keyframes.start) return null;
  if (frames.length === 0 || fps <= 0) return null;

  try {
    // Convert NormalizedLandmark[][] to PoseFrame[] shape for analyzeJump
    const poseFrames = frames.map((landmarks, i) => ({
      frameNumber: i,
      timestamp: i / fps,
      landmarks,
      confidence: 1,
    }))
    const jumpAnalysis = analyzeJump(poseFrames, fps, {
      peakJump: keyframes.peakJump,
      start: keyframes.start,
      end: keyframes.end,
    });

    if (!jumpAnalysis.isValid || isNaN(jumpAnalysis.heightNormalized)) {
      return null;
    }

    // Round to 3 decimal places
    return Math.round(jumpAnalysis.heightNormalized * 1000) / 1000;
  } catch {
    return null;
  }
}

/**
 * Calculates follow-through score
 * 
 * Good follow-through = elbow continues to extend after release
 * 
 * @param frames - All smoothed frames
 * @param releaseFrame - Frame index of release
 * @param landmarks - Shooting side landmark indices
 * @returns Follow-through score 0-100, null if invalid
 */
function calculateFollowThroughScore(
  frames: NormalizedLandmark[][],
  releaseFrame: number | null,
  landmarks: ReturnType<typeof getShootingSideLandmarks>
): number | null {
  if (releaseFrame === null) return null;

  const endFrame = Math.min(releaseFrame + FOLLOW_THROUGH_FRAMES, frames.length - 1);
  if (endFrame <= releaseFrame) return null;

  // Find the maximum elbow extension achieved in the follow-through window.
  // Scoring on the PEAK angle (not delta) avoids penalizing professionals who
  // are already near-fully extended at release — their delta is near zero but
  // their absolute extension is excellent.
  let maxAngle = 0;
  for (let i = releaseFrame; i <= endFrame; i++) {
    const angle = calculateElbowAngleAtRelease(frames[i], landmarks);
    if (angle !== null && angle > maxAngle) {
      maxAngle = angle;
    }
  }

  if (maxAngle === 0) return null;

  // 120° = score 0 (arm still very bent — poor follow-through)
  // 170°+ = score 100 (near-full extension — excellent follow-through)
  const MIN_ANGLE = 120;
  const MAX_ANGLE = 170;
  const scoreRaw = ((maxAngle - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE)) * 100;

  return Math.round(Math.max(0, Math.min(100, scoreRaw)));
}

/**
 * Calculates release timing relative to peak jump
 * 
 * @param keyframes - Detected keyframe indices
 * @param fps - Video frames per second
 * @returns Timing in milliseconds (negative = before peak), null if invalid
 */
function calculateReleaseTimingMs(
  keyframes: MetricCalculationInput['keyframes'],
  fps: number
): number | null {
  if (keyframes.release === null || keyframes.peakJump === null) return null;
  if (fps <= 0) return null;

  const framesDiff = keyframes.release - keyframes.peakJump;
  const timingMs = (framesDiff / fps) * 1000;

  return Math.round(timingMs);
}

// ============================================================================
// MAIN CALCULATOR - JUMP SHOT
// ============================================================================

/**
 * Calculates all metrics for a basketball jump shot
 * 
 * This is the primary metric calculator for basketball's most analyzed action.
 * 
 * @param input - Standardized metric calculation input
 * @returns Complete jump shot metrics object
 */
function calculateJumpShotMetrics(
  input: MetricCalculationInput
): MetricResult {
  const { smoothedFrames, keyframes, fps } = input;

  // Initialize all metrics as null (defensive default)
  const metrics: MetricResult = {
    releaseAngle: null,
    elbowAngleAtRelease: null,
    kneeAngleAtPeak: null,
    jumpHeightNormalized: null,
    stabilityIndex: null,
    followThroughScore: null,
    releaseTimingMs: null,
  };

  // Validate input data
  if (!smoothedFrames || smoothedFrames.length === 0) {
    console.warn('[BasketballMetrics] No frames provided');
    return metrics;
  }

  if (fps <= 0 || isNaN(fps)) {
    console.warn('[BasketballMetrics] Invalid FPS:', fps);
    return metrics;
  }

  // Get release frame for shooting hand detection and calculations
  const releaseFrameIndex = keyframes.release;
  const peakFrameIndex = keyframes.peakJump;

  // Detect shooting hand from release frame
  let shootingHand: 'left' | 'right' = 'right';
  if (releaseFrameIndex !== null && smoothedFrames[releaseFrameIndex]) {
    shootingHand = detectShootingHand(smoothedFrames[releaseFrameIndex]);
  }

  const landmarks = getShootingSideLandmarks(shootingHand);

  // Calculate release angle
  if (releaseFrameIndex !== null && smoothedFrames[releaseFrameIndex]) {
    const releaseFrame = smoothedFrames[releaseFrameIndex];
    const wrist = getLandmark(releaseFrame, landmarks.wrist);
    const elbow = getLandmark(releaseFrame, landmarks.elbow);

    metrics.releaseAngle = calculateReleaseAngle(wrist, elbow);
  }

  // Calculate elbow angle at release
  if (releaseFrameIndex !== null && smoothedFrames[releaseFrameIndex]) {
    metrics.elbowAngleAtRelease = calculateElbowAngleAtRelease(
      smoothedFrames[releaseFrameIndex],
      landmarks
    );
  }

  // Calculate knee angle at peak
  if (peakFrameIndex !== null && smoothedFrames[peakFrameIndex]) {
    metrics.kneeAngleAtPeak = calculateKneeAngleAtPeak(
      smoothedFrames[peakFrameIndex],
      landmarks
    );
  }

  // Calculate jump height
  metrics.jumpHeightNormalized = calculateJumpHeightNormalized(
    smoothedFrames,
    fps,
    keyframes
  );

  // Calculate stability index
  metrics.stabilityIndex = calculateStabilityIndex(
    smoothedFrames,
    keyframes.start,
    releaseFrameIndex
  );

  // Calculate follow-through score
  if (releaseFrameIndex !== null) {
    metrics.followThroughScore = calculateFollowThroughScore(
      smoothedFrames,
      releaseFrameIndex,
      landmarks
    );
  }

  // Calculate release timing
  metrics.releaseTimingMs = calculateReleaseTimingMs(keyframes, fps);

  console.log('[BasketballMetrics] Jump shot metrics calculated:', metrics);

  return metrics;
}

// ============================================================================
// ACTION ROUTER
// ============================================================================

/**
 * Placeholder for free throw metrics
 * TODO: Implement in future iteration
 */
function calculateFreeThrowMetrics(
  _input: MetricCalculationInput
): MetricResult {
  console.log('[BasketballMetrics] Free throw analysis not yet implemented');
  return {
    releaseAngle: null,
    elbowAngleAtRelease: null,
    kneeAnglePush: null,
    stabilityIndex: null,
    followThroughScore: null,
    rhythmConsistency: null,
  };
}

/**
 * Placeholder for layup metrics
 * TODO: Implement in future iteration
 */
function calculateLayupMetrics(
  _input: MetricCalculationInput
): MetricResult {
  console.log('[BasketballMetrics] Layup analysis not yet implemented');
  return {
    approachSpeed: null,
    takeoffAngle: null,
    peakHeight: null,
    bodyControl: null,
    finishingHandPosition: null,
  };
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Main basketball metric calculator
 * 
 * Routes to the appropriate action-specific calculator based on input.
 * This is the function registered in the sport registry.
 * 
 * @param input - Standardized metric calculation input
 * @returns Calculated metrics for the specified action
 */
export function calculateBasketballMetrics(
  input: MetricCalculationInput
): MetricResult {
  const { action } = input;

  console.log(`[BasketballMetrics] Calculating metrics for action: ${action}`);

  switch (action) {
    case 'jump_shot':
      return calculateJumpShotMetrics(input);

    case 'free_throw':
      return calculateFreeThrowMetrics(input);

    case 'layup':
      return calculateLayupMetrics(input);

    case 'dribbling':
      // Dribbling analysis requires different approach (temporal patterns)
      console.log('[BasketballMetrics] Dribbling analysis not yet implemented');
      return {};

    default:
      console.warn(`[BasketballMetrics] Unknown action: ${action}`);
      return {};
  }
}

/**
 * Export individual calculators for testing
 */
export const __testing = {
  calculateReleaseAngle,
  calculateElbowAngleAtRelease,
  calculateKneeAngleAtPeak,
  calculateStabilityIndex,
  calculateJumpHeightNormalized,
  calculateFollowThroughScore,
  calculateReleaseTimingMs,
  detectShootingHand,
  getLandmark,
};