/**
 * Basketball Jump Shot Benchmarks
 * 
 * These benchmarks define the ideal and acceptable ranges for each metric
 * in a basketball jump shot. Values are based on:
 * 
 * 1. Sports science research on shooting mechanics
 * 2. Analysis of professional player form
 * 3. Coaching best practices
 * 4. Practical considerations for amateur athletes
 * 
 * References:
 * - Knudson, D. (1993). "Biomechanics of the Basketball Jump Shot"
 * - Miller, S. & Bartlett, R. (1996). "The relationship between basketball 
 *   shooting kinematics, distance and playing position"
 * - Okazaki, V.H.A. (2015). "A review on the basketball jump shot"
 */

import type { SportBenchmarks, MetricBenchmark } from './types';

/**
 * Release Angle Benchmark
 * 
 * The angle at which the ball leaves the shooter's hand relative to horizontal.
 * 
 * Why 50-55° is ideal:
 * - Provides optimal arc for soft entry into basket
 * - Allows margin for error (flat shots have smaller target window)
 * - Research shows 45-55° produces highest success rates
 * 
 * Why 42-60° is acceptable:
 * - 42°: Minimum for reasonable arc, any lower is "flat"
 * - 60°: Maximum practical angle, higher requires excessive force
 */
const releaseAngleBenchmark: MetricBenchmark = {
  idealMin: 50,
  idealMax: 55,
  acceptableMin: 42,
  acceptableMax: 60,
  preference: 'center', // Both too high and too low are problematic
};

/**
 * Elbow Angle at Release Benchmark
 * 
 * The internal angle of the shooting arm's elbow at the moment of release.
 * 
 * Why 150-170° is ideal:
 * - Near-full extension provides maximum power transfer
 * - Slight bend (not locked at 180°) allows wrist snap
 * - Consistent position enables repeatable shots
 * 
 * Why 135-175° is acceptable:
 * - 135°: Below this, shooter is "pushing" the ball
 * - 175°: Above this, elbow is locked (limits follow-through)
 */
const elbowAngleBenchmark: MetricBenchmark = {
  idealMin: 150,
  idealMax: 170,
  acceptableMin: 135,
  acceptableMax: 175,
  preference: 'higher', // More extension is generally better
};

/**
 * Knee Angle at Peak Jump Benchmark
 * 
 * The angle of the legs at the peak of the jump.
 * 
 * Why 160-180° is ideal:
 * - Full leg extension indicates complete power transfer
 * - Extended legs provide stable platform for upper body mechanics
 * - Indicates proper jump timing
 * 
 * Why 140-180° is acceptable:
 * - 140°: Some bend is okay, especially for quick-release shots
 * - 180°: Full extension (legs straight)
 */
const kneeAngleBenchmark: MetricBenchmark = {
  idealMin: 160,
  idealMax: 180,
  acceptableMin: 140,
  acceptableMax: 180,
  preference: 'higher', // More extension is better
};

/**
 * Jump Height Benchmark (Normalized)
 * 
 * Vertical displacement as a fraction of body height.
 * 
 * Why 0.08-0.15 is ideal:
 * - 0.08 (8%): Minimum for a "jump" shot vs. set shot
 * - 0.15 (15%): High but achievable for most athletes
 * - Higher release point is harder to block
 * 
 * Why 0.03-0.25 is acceptable:
 * - 0.03: Very low jump, but still technically a jump shot
 * - 0.25: Elite level jump height
 * 
 * Note: This metric has lower weight because:
 * - Jump height varies greatly with fatigue
 * - Short players can compensate with higher jumps
 * - Shot form is more important than raw height
 */
const jumpHeightBenchmark: MetricBenchmark = {
  idealMin: 0.08,
  idealMax: 0.15,
  acceptableMin: 0.03,
  acceptableMax: 0.25,
  preference: 'higher', // Higher jumps generally better
};

/**
 * Stability Index Benchmark
 * 
 * Measure of lateral body movement during the shot (0-100 scale).
 * 
 * Why 85-100 is ideal:
 * - Minimal lateral drift = consistent aim
 * - Stable base = repeatable mechanics
 * - Professional shooters exhibit very low sway
 * 
 * Why 65-100 is acceptable:
 * - 65: Noticeable sway but still functional
 * - Below 65: Significant balance issues
 * 
 * Exception: Fadeaway shots intentionally lower stability
 */
const stabilityIndexBenchmark: MetricBenchmark = {
  idealMin: 85,
  idealMax: 100,
  acceptableMin: 65,
  acceptableMax: 100,
  preference: 'higher', // More stability is better
};

/**
 * Follow-Through Score Benchmark
 * 
 * Quality of arm extension after release (0-100 scale).
 * 
 * Why 80-100 is ideal:
 * - Good follow-through ensures clean release
 * - Indicates proper wrist snap
 * - Visual cue for consistent shooting
 * 
 * Why 50-100 is acceptable:
 * - Some shooters have abbreviated follow-through
 * - Quick-release shots may have less extension
 */
const followThroughBenchmark: MetricBenchmark = {
  idealMin: 80,
  idealMax: 100,
  acceptableMin: 50,
  acceptableMax: 100,
  preference: 'higher',
};

/**
 * Release Timing Benchmark (milliseconds relative to peak)
 * 
 * When the ball is released relative to the peak of the jump.
 * Negative = before peak (rising), Positive = after peak (falling)
 * 
 * Why -50 to 0ms is ideal:
 * - Releasing slightly before peak maximizes momentum transfer
 * - At peak, vertical velocity is zero (clean release)
 * - Pro shooters typically release just before peak
 * 
 * Why -100 to +50ms is acceptable:
 * - -100ms: Very early release (quick shot)
 * - +50ms: Slightly after peak (still effective)
 */
const releaseTimingBenchmark: MetricBenchmark = {
  idealMin: -50,
  idealMax: 0,
  acceptableMin: -100,
  acceptableMax: 50,
  preference: 'center', // Both too early and too late are penalized
};

/**
 * Metric Weights for Basketball Jump Shot
 * 
 * Why these specific weights?
 * 
 * RELEASE ANGLE (0.25): Highest weight because:
 * - Most directly affects shot success
 * - Common flaw among amateur shooters
 * - Easy to coach and correct
 * 
 * STABILITY INDEX (0.20): High weight because:
 * - Balance is fundamental to consistent shooting
 * - Affects every other aspect of the shot
 * - Often overlooked by self-taught players
 * 
 * ELBOW ANGLE (0.18): Important because:
 * - Directly affects ball trajectory control
 * - "Chicken wing" elbow is common flaw
 * - Key coaching point for form correction
 * 
 * FOLLOW-THROUGH (0.15): Moderate weight because:
 * - Indicates completion of shooting motion
 * - Important for accuracy but secondary to release
 * 
 * KNEE ANGLE (0.12): Lower weight because:
 * - More about power than accuracy
 * - Varies with shot distance and situation
 * 
 * JUMP HEIGHT (0.10): Lowest weight because:
 * - Varies with fatigue and situation
 * - Not critical for form evaluation
 * - Short players can still score effectively
 * 
 * Total: 0.25 + 0.20 + 0.18 + 0.15 + 0.12 + 0.10 = 1.00
 */
const basketballJumpShotWeights = {
  releaseAngle: 0.25,
  stabilityIndex: 0.20,
  elbowAngleAtRelease: 0.18,
  followThroughScore: 0.15,
  kneeAngleAtPeak: 0.12,
  jumpHeightNormalized: 0.10,
};

/**
 * Complete Basketball Jump Shot Benchmarks
 */
export const basketballJumpShotBenchmarks: SportBenchmarks = {
  metrics: {
    releaseAngle: releaseAngleBenchmark,
    elbowAngleAtRelease: elbowAngleBenchmark,
    kneeAngleAtPeak: kneeAngleBenchmark,
    jumpHeightNormalized: jumpHeightBenchmark,
    stabilityIndex: stabilityIndexBenchmark,
    followThroughScore: followThroughBenchmark,
    releaseTimingMs: releaseTimingBenchmark,
  },
  weights: basketballJumpShotWeights,
  minRequiredMetrics: 3, // Need at least 3 metrics for valid score
};

/**
 * Get benchmarks for a specific basketball action
 */
export function getBasketballBenchmarks(action: string): SportBenchmarks | null {
  switch (action) {
    case 'jump_shot':
      return basketballJumpShotBenchmarks;
    
    case 'free_throw':
      // TODO: Implement free throw benchmarks
      // Similar to jump shot but with different jump height expectations
      return basketballJumpShotBenchmarks; // Fallback for now
    
    case 'layup':
      // TODO: Implement layup benchmarks
      // Very different metrics (approach speed, body control, etc.)
      return null;
    
    default:
      return null;
  }
}

/**
 * Export individual benchmarks for testing
 */
export const __testing = {
  releaseAngleBenchmark,
  elbowAngleBenchmark,
  kneeAngleBenchmark,
  jumpHeightBenchmark,
  stabilityIndexBenchmark,
  followThroughBenchmark,
  releaseTimingBenchmark,
};