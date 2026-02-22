/**
 * Scoring Utility Functions
 * 
 * Pure, reusable functions for score normalization and calculation.
 * These utilities are sport-agnostic and can be used by any sport adapter.
 * 
 * All functions are designed to be:
 * - Pure (no side effects)
 * - Defensive (handle edge cases)
 * - Type-safe (full TypeScript coverage)
 */

import type { MetricBenchmark } from './types';

/**
 * Clamps a value to the 0-100 score range
 * 
 * @param score - Raw score value
 * @returns Clamped score between 0 and 100
 */
export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, score));
}

/**
 * Normalizes a value to a 0-100 scale based on min/max range
 * 
 * Linear interpolation:
 * - value = min → 0
 * - value = max → 100
 * - value between → proportional
 * - value outside → clamped
 * 
 * @param value - Raw value to normalize
 * @param min - Minimum of range (maps to 0)
 * @param max - Maximum of range (maps to 100)
 * @returns Normalized score 0-100
 * 
 * @example
 * normalizeToRange(75, 50, 100) // returns 50
 * normalizeToRange(100, 50, 100) // returns 100
 * normalizeToRange(50, 50, 100) // returns 0
 */
export function normalizeToRange(
  value: number,
  min: number,
  max: number
): number {
  // Handle invalid inputs
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
    return 0;
  }
  
  // Handle degenerate range
  if (max <= min) {
    return value >= min ? 100 : 0;
  }
  
  // Linear interpolation
  const normalized = ((value - min) / (max - min)) * 100;
  
  return clampScore(normalized);
}

/**
 * Scores a value using an ideal window with optional acceptable bounds
 * 
 * Scoring Curve Logic:
 * 
 * ```
 * Score
 *  100 ┤     ┌────────┐
 *      │    /│        │\
 *      │   / │ IDEAL  │ \
 *      │  /  │ WINDOW │  \
 *      │ /   │        │   \
 *    0 ┤/    │        │    \
 *      └─────┴────────┴─────→ Value
 *      acc   ideal    ideal  acc
 *      Min   Min      Max    Max
 * ```
 * 
 * - Within ideal window: 100 (perfect score)
 * - Between acceptable and ideal: Linear interpolation (0-100)
 * - Outside acceptable: 0
 * 
 * @param value - Raw metric value
 * @param benchmark - Benchmark configuration with ranges
 * @returns Score 0-100
 */
export function scoreWithIdealWindow(
  value: number,
  benchmark: MetricBenchmark
): number {
  // Handle invalid input
  if (!Number.isFinite(value)) {
    return 0;
  }
  
  const { idealMin, idealMax, acceptableMin, acceptableMax, preference } = benchmark;
  
  // Within ideal window: perfect score
  if (value >= idealMin && value <= idealMax) {
    return 100;
  }
  
  // Below ideal minimum
  if (value < idealMin) {
    // Below acceptable minimum: zero
    if (value < acceptableMin) {
      return 0;
    }
    
    // Between acceptable and ideal minimum: interpolate
    // As value approaches idealMin, score approaches 100
    const range = idealMin - acceptableMin;
    const distance = idealMin - value;
    const ratio = 1 - (distance / range);
    
    return clampScore(ratio * 100);
  }
  
  // Above ideal maximum
  if (value > idealMax) {
    // Above acceptable maximum: zero
    if (value > acceptableMax) {
      return 0;
    }
    
    // Between ideal and acceptable maximum: interpolate
    // As value approaches idealMax, score approaches 100
    const range = acceptableMax - idealMax;
    const distance = value - idealMax;
    const ratio = 1 - (distance / range);
    
    return clampScore(ratio * 100);
  }
  
  // Should never reach here, but return 0 for safety
  return 0;
}

/**
 * Alternative scoring with asymmetric penalty based on preference
 * 
 * Some metrics have a directional preference:
 * - Jump height: Higher is always better
 * - Stability: More stable is always better
 * - Release angle: Both too high and too low are bad
 * 
 * This function applies different penalty curves based on the direction
 * of deviation from the ideal window.
 * 
 * @param value - Raw metric value
 * @param benchmark - Benchmark with preference direction
 * @returns Score 0-100 with asymmetric penalties
 */
export function scoreWithPreference(
  value: number,
  benchmark: MetricBenchmark
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  
  const { idealMin, idealMax, acceptableMin, acceptableMax, preference } = benchmark;
  
  // Within ideal window: perfect score
  if (value >= idealMin && value <= idealMax) {
    return 100;
  }
  
  // Calculate base score using standard window scoring
  const baseScore = scoreWithIdealWindow(value, benchmark);
  
  // Apply preference-based adjustment
  if (preference === 'center') {
    // No adjustment - both directions equally penalized
    return baseScore;
  }
  
  if (preference === 'higher') {
    // Being above ideal is better than being below
    if (value > idealMax && value <= acceptableMax) {
      // Above ideal but within acceptable: mild penalty
      const ratio = (value - idealMax) / (acceptableMax - idealMax);
      return clampScore(100 - (ratio * 20)); // Max 20 point penalty
    }
    // Below ideal: use standard penalty
    return baseScore;
  }
  
  if (preference === 'lower') {
    // Being below ideal is better than being above
    if (value < idealMin && value >= acceptableMin) {
      // Below ideal but within acceptable: mild penalty
      const ratio = (idealMin - value) / (idealMin - acceptableMin);
      return clampScore(100 - (ratio * 20)); // Max 20 point penalty
    }
    // Above ideal: use standard penalty
    return baseScore;
  }
  
  return baseScore;
}

/**
 * Calculates weighted average of scores
 * 
 * @param scores - Map of metric names to scores (0-100)
 * @param weights - Map of metric names to weights (should sum to 1)
 * @returns Weighted average score 0-100
 */
export function calculateWeightedScore(
  scores: Record<string, number>,
  weights: Record<string, number>
): number {
  let totalWeight = 0;
  let weightedSum = 0;
  
  for (const [metric, score] of Object.entries(scores)) {
    const weight = weights[metric];
    
    if (weight !== undefined && weight > 0 && Number.isFinite(score)) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }
  
  // Handle case where no valid scores/weights
  if (totalWeight === 0) {
    return 0;
  }
  
  // Normalize in case weights don't sum to 1
  const normalizedScore = weightedSum / totalWeight;
  
  return clampScore(Math.round(normalizedScore));
}

/**
 * Adjusts weights dynamically when some metrics are missing
 * 
 * When a metric is null/unavailable, we redistribute its weight
 * proportionally to the remaining metrics.
 * 
 * @param availableMetrics - Set of metric keys that have valid values
 * @param originalWeights - Original weight configuration
 * @returns Adjusted weights that sum to 1
 */
export function adjustWeightsForMissingMetrics(
  availableMetrics: Set<string>,
  originalWeights: Record<string, number>
): Record<string, number> {
  const adjustedWeights: Record<string, number> = {};
  
  // Calculate total weight of available metrics
  let availableWeight = 0;
  for (const [metric, weight] of Object.entries(originalWeights)) {
    if (availableMetrics.has(metric)) {
      availableWeight += weight;
    }
  }
  
  // If no metrics available, return empty
  if (availableWeight === 0) {
    return adjustedWeights;
  }
  
  // Normalize weights to sum to 1
  for (const [metric, weight] of Object.entries(originalWeights)) {
    if (availableMetrics.has(metric)) {
      adjustedWeights[metric] = weight / availableWeight;
    }
  }
  
  return adjustedWeights;
}

/**
 * Calculates confidence based on how many metrics were available
 * 
 * @param includedCount - Number of metrics included in scoring
 * @param totalCount - Total number of possible metrics
 * @param minRequired - Minimum metrics needed for valid score
 * @returns Confidence value 0-1
 */
export function calculateScoringConfidence(
  includedCount: number,
  totalCount: number,
  minRequired: number
): number {
  if (includedCount < minRequired || totalCount === 0) {
    return 0;
  }
  
  // Linear confidence based on metric coverage
  // 100% of metrics = 1.0 confidence
  // minRequired metrics = 0.5 confidence
  const baseConfidence = 0.5;
  const additionalConfidence = 0.5;
  
  const coverageRatio = (includedCount - minRequired) / (totalCount - minRequired);
  const confidence = baseConfidence + (additionalConfidence * Math.max(0, coverageRatio));
  
  return Math.min(1, confidence);
}

/**
 * Applies a grade curve to a score
 * 
 * Optional utility to make scoring feel more "fair" by
 * applying a slight boost to mid-range scores.
 * 
 * Without curve:  50 raw → 50 final
 * With curve:     50 raw → 55 final (example)
 * 
 * @param score - Raw score 0-100
 * @param curveFactor - How much to curve (0 = none, 1 = maximum)
 * @returns Curved score 0-100
 */
export function applyGradeCurve(
  score: number,
  curveFactor: number = 0.1
): number {
  if (!Number.isFinite(score) || curveFactor <= 0) {
    return clampScore(score);
  }
  
  // Square root curve - boosts lower scores more than higher scores
  // score^(1-curveFactor) normalized to 0-100
  const normalizedScore = score / 100;
  const curvedNormalized = Math.pow(normalizedScore, 1 - curveFactor);
  const curvedScore = curvedNormalized * 100;
  
  return clampScore(Math.round(curvedScore));
}