/**
 * Basketball Scoring Engine
 * 
 * Calculates performance scores for basketball actions based on
 * extracted metrics and benchmark comparisons.
 * 
 * The scoring process:
 * 1. Validate input metrics
 * 2. Score each metric against its benchmark
 * 3. Apply weights to calculate overall score
 * 4. Generate detailed breakdown
 */

import type { ScoringResult, MetricScoreResult } from './types';
import { getBasketballBenchmarks } from './basketballBenchmarks';
import {
  scoreWithPreference,
  calculateWeightedScore,
  adjustWeightsForMissingMetrics,
  calculateScoringConfidence,
  applyGradeCurve,
  clampScore,
} from './scoringUtils';

/**
 * Calculates the complete basketball performance score
 * 
 * @param metrics - Calculated metrics from the pose analysis
 * @param action - Specific basketball action (default: 'jump_shot')
 * @returns Complete scoring result with breakdown
 */
export function calculateBasketballScore(
  metrics: Record<string, number | null>,
  action: string = 'jump_shot'
): ScoringResult {
  const startTime = performance.now();

  // Get benchmarks for this action
  const benchmarks = getBasketballBenchmarks(action);

  // Handle unsupported action
  if (!benchmarks) {
    console.warn(`[BasketballScoring] No benchmarks for action: ${action}`);
    return createEmptyResult(`Unsupported action: ${action}`);
  }

  // Initialize result tracking
  const details: Record<string, MetricScoreResult> = {};
  const breakdown: Record<string, number> = {};
  const availableMetrics = new Set<string>();

  // Score each metric
  for (const [metricKey, benchmark] of Object.entries(benchmarks.metrics)) {
    const rawValue = metrics[metricKey];

    // Handle null/missing metric
    if (rawValue === null || rawValue === undefined || !Number.isFinite(rawValue)) {
      details[metricKey] = {
        rawValue: null,
        normalizedScore: null,
        included: false,
        excludeReason: 'Metric not available or invalid',
      };
      continue;
    }

    // Calculate score for this metric (preference-aware for directional metrics)
    const normalizedScore = scoreWithPreference(rawValue, benchmark);

    // Check for NaN (shouldn't happen with proper defensive coding, but verify)
    if (!Number.isFinite(normalizedScore)) {
      details[metricKey] = {
        rawValue,
        normalizedScore: null,
        included: false,
        excludeReason: 'Score calculation resulted in invalid value',
      };
      continue;
    }

    // Valid score
    details[metricKey] = {
      rawValue,
      normalizedScore,
      included: true,
    };

    breakdown[metricKey] = Math.round(normalizedScore);
    availableMetrics.add(metricKey);
  }

  // Check minimum metrics requirement
  const metricsIncluded = availableMetrics.size;
  const metricsTotal = Object.keys(benchmarks.metrics).length;

  if (metricsIncluded < benchmarks.minRequiredMetrics) {
    console.warn(
      `[BasketballScoring] Insufficient metrics: ${metricsIncluded}/${benchmarks.minRequiredMetrics} required`
    );
    return {
      overallScore: 0,
      breakdown,
      details,
      metricsIncluded,
      metricsTotal,
      confidence: 0,
      calculatedAt: Date.now(),
    };
  }

  // Adjust weights for missing metrics
  const adjustedWeights = adjustWeightsForMissingMetrics(
    availableMetrics,
    benchmarks.weights
  );

  // Calculate weighted overall score
  const overallScore = calculateWeightedScore(breakdown, adjustedWeights);

  // Calculate confidence
  const confidence = calculateScoringConfidence(
    metricsIncluded,
    metricsTotal,
    benchmarks.minRequiredMetrics
  );

  const endTime = performance.now();
  console.log(
    `[BasketballScoring] Calculated score in ${(endTime - startTime).toFixed(2)}ms:`,
    { overallScore, metricsIncluded, confidence }
  );

  // Apply a light grade curve (0.15) — just enough to smooth harsh edges
  // without inflating scores unrealistically
  const curvedScore = applyGradeCurve(overallScore, 0.15);

  return {
    overallScore: clampScore(curvedScore),
    breakdown,
    details,
    metricsIncluded,
    metricsTotal,
    confidence,
    calculatedAt: Date.now(),
  };
}

/**
 * Creates an empty scoring result for error cases
 */
function createEmptyResult(reason: string): ScoringResult {
  console.error(`[BasketballScoring] ${reason}`);

  return {
    overallScore: 0,
    breakdown: {},
    details: {},
    metricsIncluded: 0,
    metricsTotal: 0,
    confidence: 0,
    calculatedAt: Date.now(),
  };
}

/**
 * Quick score calculation without full details
 * Useful for real-time updates or previews
 * 
 * @param metrics - Calculated metrics
 * @param action - Basketball action
 * @returns Overall score only (0-100)
 */
export function calculateBasketballScoreQuick(
  metrics: Record<string, number | null>,
  action: string = 'jump_shot'
): number {
  const result = calculateBasketballScore(metrics, action);
  return result.overallScore;
}

/**
 * Gets a letter grade from a numeric score
 * 
 * @param score - Numeric score 0-100
 * @returns Letter grade (A+, A, A-, B+, etc.)
 */
export function getLetterGrade(score: number): string {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}

/**
 * Gets a descriptive performance level from a score
 * 
 * @param score - Numeric score 0-100
 * @returns Performance level description
 */
export function getPerformanceLevel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Average';
  if (score >= 60) return 'Below Average';
  if (score >= 50) return 'Needs Improvement';
  return 'Developing';
}

/**
 * Identifies the weakest metrics that need improvement
 * 
 * @param breakdown - Score breakdown by metric
 * @param count - Number of weak metrics to return
 * @returns Array of metric keys sorted by weakness
 */
export function getWeakestMetrics(
  breakdown: Record<string, number>,
  count: number = 3
): string[] {
  return Object.entries(breakdown)
    .sort(([, a], [, b]) => a - b)
    .slice(0, count)
    .map(([key]) => key);
}

/**
 * Identifies the strongest metrics (for positive feedback)
 * 
 * @param breakdown - Score breakdown by metric
 * @param count - Number of strong metrics to return
 * @returns Array of metric keys sorted by strength
 */
export function getStrongestMetrics(
  breakdown: Record<string, number>,
  count: number = 3
): string[] {
  return Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([key]) => key);
}