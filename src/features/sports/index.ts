/**
 * Sports feature module exports
 * 
 * This is the public API for the sport-specific metric engine.
 */

// Core registry and types
export {
  sportMetricRegistry,
  getMetricCalculator,
  calculateSportMetrics,
  isSportSupported,
  getSupportedSports,
} from './sportRegistry';

export type {
  MetricCalculationInput,
  MetricResult,
  SportMetricCalculator,
  KeyframeData,
} from './types';

// Sport-specific exports
export { calculateBasketballMetrics } from './basketball';
export type { BasketballJumpShotMetrics, BasketballMetrics } from './basketball';

export { calculateVolleyballMetrics } from './volleyball';
export { calculateBadmintonMetrics } from './badminton';
export { calculateCricketMetrics } from './cricket';
export { calculateTableTennisMetrics } from './tabletennis';