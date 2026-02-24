/**
 * Scoring Engine Module Exports
 */

// Types
export type {
  MetricBenchmark,
  MetricWeights,
  SportBenchmarks,
  MetricScoreResult,
  ScoringResult,
  SportScoringFunction,
} from './types';

// Utilities
export {
  clampScore,
  normalizeToRange,
  scoreWithIdealWindow,
  scoreWithPreference,
  calculateWeightedScore,
  adjustWeightsForMissingMetrics,
  calculateScoringConfidence,
  applyGradeCurve,
} from './scoringUtils';

// Basketball
export {
  calculateBasketballScore,
  calculateBasketballScoreQuick,
  getLetterGrade,
  getPerformanceLevel,
  getWeakestMetrics,
  getStrongestMetrics,
} from './basketballScoring';

export {
  basketballJumpShotBenchmarks,
  getBasketballBenchmarks,
} from './basketballBenchmarks';

// Volleyball
export { calculateVolleyballScore } from './volleyballScoring';
export { getVolleyballBenchmarks } from './volleyballBenchmarks';

// Badminton
export { calculateBadmintonScore } from './badmintonScoring';
export { getBadmintonBenchmarks } from './badmintonBenchmarks';