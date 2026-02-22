/**
 * Basketball-specific metric type definitions
 * 
 * These types define the metrics calculated for basketball actions,
 * starting with the jump shot as the primary implemented action.
 */

/**
 * Metrics calculated for a basketball jump shot
 * 
 * Each metric is nullable to handle cases where:
 * - Required keyframes weren't detected
 * - Landmarks were occluded or low confidence
 * - Video quality was insufficient
 */
export interface BasketballJumpShotMetrics {
  /**
   * Release angle relative to horizontal (degrees)
   * 
   * Optimal range: 45-55° for most shooters
   * Calculated from wrist-elbow vector at release frame
   * 
   * Why this matters:
   * - Too flat (<40°): Ball likely to hit front rim
   * - Too steep (>60°): Requires more force, less consistent
   * - Sweet spot allows optimal arc for soft landing in basket
   */
  releaseAngle: number | null;

  /**
   * Internal elbow angle at moment of release (degrees)
   * 
   * Optimal range: 150-170° (nearly extended but not locked)
   * Calculated from shoulder-elbow-wrist triangle
   * 
   * Why this matters:
   * - Full extension (180°): No follow-through room, wrist strain
   * - Under-extended (<140°): Pushing shot, inconsistent arc
   * - Optimal extension provides power transfer and control
   */
  elbowAngleAtRelease: number | null;

  /**
   * Knee angle at peak jump height (degrees)
   * 
   * Optimal range: 160-180° (legs extended)
   * Calculated from hip-knee-ankle triangle
   * 
   * Why this matters:
   * - Bent knees at peak (<150°): Didn't fully utilize leg power
   * - Extended legs: Full power transfer to jump
   * - Indicates proper timing of jump mechanics
   */
  kneeAngleAtPeak: number | null;

  /**
   * Normalized jump height (0-1 scale)
   * 
   * Represents vertical displacement as fraction of body height
   * Example: 0.15 means jumped 15% of body height
   * 
   * Why this matters:
   * - Higher release point is harder to block
   * - Consistent jump height = consistent shot timing
   * - Lower values acceptable for set shots
   */
  jumpHeightNormalized: number | null;

  /**
   * Shot stability index (0-100 scale)
   * 
   * Measures horizontal body sway during shot
   * 100 = perfectly stable (no lateral movement)
   * 0 = excessive lateral movement
   * 
   * Why this matters:
   * - Lateral drift causes inconsistent aim
   * - Stability indicates core strength and balance
   * - Fadeaways intentionally lower this value
   */
  stabilityIndex: number | null;

  /**
   * Follow-through consistency (0-100 scale)
   * 
   * Measures how well the shooting arm extends after release
   * Compares elbow angle progression post-release
   */
  followThroughScore: number | null;

  /**
   * Release timing relative to peak jump (milliseconds)
   * 
   * Negative = released before peak (rising)
   * Zero = released at peak
   * Positive = released after peak (falling)
   * 
   * Most pros release slightly before peak (-50 to 0ms)
   */
  releaseTimingMs: number | null;
}

/**
 * Metrics for free throw analysis
 * Similar to jump shot but without jump height emphasis
 */
export interface BasketballFreeThrowMetrics {
  releaseAngle: number | null;
  elbowAngleAtRelease: number | null;
  kneeAnglePush: number | null;
  stabilityIndex: number | null;
  followThroughScore: number | null;
  rhythmConsistency: number | null;
}

/**
 * Metrics for layup analysis
 */
export interface BasketballLayupMetrics {
  approachSpeed: number | null;
  takeoffAngle: number | null;
  peakHeight: number | null;
  bodyControl: number | null;
  finishingHandPosition: number | null;
}

/**
 * Union type for all basketball metrics
 */
export type BasketballMetrics =
  | BasketballJumpShotMetrics
  | BasketballFreeThrowMetrics
  | BasketballLayupMetrics;

/**
 * Supported basketball actions
 */
export type BasketballAction = 'jump_shot' | 'free_throw' | 'layup' | 'dribbling';

/**
 * Type guard to check if action is a basketball action
 */
export function isBasketballAction(action: string): action is BasketballAction {
  return ['jump_shot', 'free_throw', 'layup', 'dribbling'].includes(action);
}