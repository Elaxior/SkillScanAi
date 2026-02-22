/**
 * Scoring Engine Type Definitions
 * 
 * These types define the structure of benchmarks, score results,
 * and configuration for the performance evaluation system.
 */

/**
 * Defines the acceptable and ideal ranges for a single metric
 * 
 * Why ranges instead of exact numbers?
 * 1. BIOLOGICAL VARIANCE: No two athletes have identical mechanics
 * 2. STYLE ACCOMMODATION: Different shooting styles can all be effective
 * 3. MEASUREMENT NOISE: Pose estimation has inherent uncertainty
 * 4. FAIRNESS: Punishing minor deviations would frustrate users
 * 
 * The range system allows:
 * - Perfect scores within the "ideal" window
 * - Gradual degradation in the "acceptable" zone
 * - Zero only for clearly incorrect form
 */
export interface MetricBenchmark {
  /** Lower bound of ideal range (100% score) */
  idealMin: number;
  /** Upper bound of ideal range (100% score) */
  idealMax: number;
  /** Lower bound of acceptable range (partial credit) */
  acceptableMin: number;
  /** Upper bound of acceptable range (partial credit) */
  acceptableMax: number;
  /** 
   * Direction of preference when outside ideal range
   * - 'higher': Values above idealMax are better than below idealMin
   * - 'lower': Values below idealMin are better than above idealMax
   * - 'center': Deviation in either direction is equally penalized
   */
  preference: 'higher' | 'lower' | 'center';
}

/**
 * Weight assigned to each metric in the overall score calculation
 * Values should sum to 1.0 for proper weighted average
 */
export interface MetricWeights {
  [metricKey: string]: number;
}

/**
 * Complete benchmark configuration for a sport/action combination
 */
export interface SportBenchmarks {
  /** Benchmark ranges for each metric */
  metrics: Record<string, MetricBenchmark>;
  /** Weight of each metric in overall score */
  weights: MetricWeights;
  /** Minimum number of valid metrics required to compute score */
  minRequiredMetrics: number;
}

/**
 * Individual metric score result
 */
export interface MetricScoreResult {
  /** Raw metric value */
  rawValue: number | null;
  /** Normalized score 0-100 */
  normalizedScore: number | null;
  /** Whether this metric was included in overall calculation */
  included: boolean;
  /** Reason if not included */
  excludeReason?: string;
}

/**
 * Complete scoring result for a performance
 */
export interface ScoringResult {
  /** Overall weighted score 0-100 */
  overallScore: number;
  /** Individual score for each metric */
  breakdown: Record<string, number>;
  /** Detailed results per metric */
  details: Record<string, MetricScoreResult>;
  /** Number of metrics included in calculation */
  metricsIncluded: number;
  /** Total possible metrics */
  metricsTotal: number;
  /** Confidence in the score (based on how many metrics were valid) */
  confidence: number;
  /** Timestamp of calculation */
  calculatedAt: number;
}

/**
 * Scoring function signature for sport-specific implementations
 */
export type SportScoringFunction = (
  metrics: Record<string, number | null>
) => ScoringResult;