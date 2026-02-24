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
// Release angle: ideal range for a good jump shot.
// 2D frontal-camera projection typically reads higher (75-90°) because
// the wrist moves mostly vertically on screen. preference:'higher' gives
// only a mild penalty for readings above the ideal window, so frontal-cam
// videos still score fairly instead of zeroing out.
const releaseAngleBenchmark: MetricBenchmark = {
  idealMin: 42,
  idealMax: 67,
  acceptableMin: 0,
  acceptableMax: 90,
  preference: 'higher',
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
  idealMin: 152,
  idealMax: 174,
  acceptableMin: 115,
  acceptableMax: 180,
  preference: 'higher',
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
  idealMin: 162,
  idealMax: 180,
  acceptableMin: 125,
  acceptableMax: 180,
  preference: 'higher',
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
  idealMin: 0.05,
  idealMax: 0.18,
  acceptableMin: 0.005,
  acceptableMax: 0.35,
  preference: 'higher',
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
  idealMin: 72,
  idealMax: 100,
  acceptableMin: 38,
  acceptableMax: 100,
  preference: 'higher',
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
  idealMin: 65,
  idealMax: 100,
  acceptableMin: 28,
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
  idealMin: -120,
  idealMax: 60,
  acceptableMin: -350,
  acceptableMax: 250,
  preference: 'center',
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
 * Free Throw Benchmarks
 *
 * Same form cues as jump shot but:
 * - No jump-height requirement (set shot is legal)
 * - Rhythm/consistency carries more weight
 * - Stability is more important (no defender pressure)
 */
const freeThrowBenchmarks: SportBenchmarks = {
  metrics: {
    releaseAngle: releaseAngleBenchmark,
    elbowAngleAtRelease: elbowAngleBenchmark,
    kneeAnglePush: {
      idealMin: 150,
      idealMax: 180,
      acceptableMin: 110,
      acceptableMax: 180,
      preference: 'higher',
    },
    stabilityIndex: {
      idealMin: 88,
      idealMax: 100,
      acceptableMin: 65,
      acceptableMax: 100,
      preference: 'higher',
    },
    followThroughScore: followThroughBenchmark,
    rhythmConsistency: {
      idealMin: 72,
      idealMax: 100,
      acceptableMin: 40,
      acceptableMax: 100,
      preference: 'higher',
    },
  },
  weights: {
    releaseAngle: 0.28,
    elbowAngleAtRelease: 0.20,
    stabilityIndex: 0.22,
    followThroughScore: 0.15,
    kneeAnglePush: 0.08,
    rhythmConsistency: 0.07,
  },
  minRequiredMetrics: 2,
};

/**
 * Layup Benchmarks
 */
const layupBenchmarks: SportBenchmarks = {
  metrics: {
    approachSpeed: {
      idealMin: 55,
      idealMax: 100,
      acceptableMin: 20,
      acceptableMax: 100,
      preference: 'higher',
    },
    takeoffAngle: {
      idealMin: 55,
      idealMax: 80,
      acceptableMin: 35,
      acceptableMax: 88,
      preference: 'center',
    },
    peakHeight: {
      idealMin: 0.05,
      idealMax: 0.18,
      acceptableMin: 0.01,
      acceptableMax: 0.30,
      preference: 'higher',
    },
    stabilityIndex: {
      idealMin: 68,
      idealMax: 100,
      acceptableMin: 35,
      acceptableMax: 100,
      preference: 'higher',
    },
    finishHandPosition: {
      idealMin: 78,
      idealMax: 110,
      acceptableMin: 55,
      acceptableMax: 125,
      preference: 'higher',
    },
  },
  weights: {
    approachSpeed: 0.20,
    takeoffAngle: 0.22,
    peakHeight: 0.15,
    stabilityIndex: 0.22,
    finishHandPosition: 0.21,
  },
  minRequiredMetrics: 2,
};

/**
 * Dribbling Stance Benchmarks
 *
 * Evaluates the quality of ball-handling posture and body control.
 * Lower knee angle = deeper stance = better ball protection and agility.
 */
const dribblingBenchmarks: SportBenchmarks = {
  metrics: {
    kneeBendScore: {
      // 0-100 score derived from hip drop ratio (how low hips are vs body height)
      // Higher = deeper stance = better ball control and protection
      idealMin: 50,
      idealMax: 100,
      acceptableMin: 25,
      acceptableMax: 100,
      preference: 'higher',
    },
    stanceWidth: {
      // Ankle separation as % of shoulder width.
      // Dribbling allows much wider stance than shooting — especially in drills.
      idealMin: 70,
      idealMax: 180,
      acceptableMin: 45,
      acceptableMax: 230,
      preference: 'center',
    },
    balanceScore: {
      idealMin: 55,
      idealMax: 100,
      acceptableMin: 30,
      acceptableMax: 100,
      preference: 'higher',
    },
    trunkLean: {
      idealMin: 5,
      idealMax: 25,
      acceptableMin: 0,
      acceptableMax: 40,
      preference: 'center',
    },
  },
  weights: {
    kneeBendScore: 0.35,
    balanceScore: 0.30,
    stanceWidth: 0.20,
    trunkLean: 0.15,
  },
  minRequiredMetrics: 1,
};

/**
 * Get benchmarks for a specific basketball action
 */
export function getBasketballBenchmarks(action: string): SportBenchmarks | null {
  switch (action) {
    case 'jump_shot':
      return basketballJumpShotBenchmarks;
    case 'free_throw':
      return freeThrowBenchmarks;
    case 'layup':
      return layupBenchmarks;
    case 'dribbling':
      return dribblingBenchmarks;
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