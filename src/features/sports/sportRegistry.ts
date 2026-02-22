/**
 * Sport Metric Registry
 * 
 * This module provides a centralized registry for all sport-specific metric calculators.
 * It implements the Adapter Pattern to:
 * 
 * 1. AVOID IF-ELSE CHAINS
 *    Instead of: if (sport === 'basketball') { ... } else if (sport === 'volleyball') { ... }
 *    We use: sportMetricRegistry[sport](input)
 *    This is O(1) lookup vs O(n) conditional branching.
 * 
 * 2. MAKE ADDING SPORTS EASY
 *    To add a new sport:
 *    - Create src/features/sports/newSport/newSportMetrics.ts
 *    - Export calculateNewSportMetrics function
 *    - Add one line to the registry
 *    No modification of any other files needed (Open/Closed Principle).
 * 
 * 3. PREVENT TIGHT COUPLING
 *    Each sport module is self-contained and knows nothing about other sports.
 *    Changes to basketball don't affect volleyball.
 *    Testing is isolated per sport.
 * 
 * 4. ENABLE FUTURE OPTIMIZATIONS
 *    - Lazy loading: dynamically import only needed sport
 *    - Code splitting: each sport can be a separate chunk
 *    - A/B testing: swap calculators without code changes
 */

import type { MetricCalculationInput, MetricResult, SportMetricCalculator } from './types';
import { calculateBasketballMetrics } from './basketball';
import { calculateVolleyballMetrics } from './volleyball';
import { calculateBadmintonMetrics } from './badminton';
import { calculateCricketMetrics } from './cricket';
import { calculateTableTennisMetrics } from './tabletennis';

/**
 * Registry mapping sport identifiers to their metric calculators
 * 
 * Keys must match the Sport enum values from src/types/sport.ts:
 * - 'basketball'
 * - 'volleyball'
 * - 'badminton'
 * - 'cricket'
 * - 'table_tennis'
 */
export const sportMetricRegistry: Record<string, SportMetricCalculator> = {
  basketball: calculateBasketballMetrics,
  volleyball: calculateVolleyballMetrics,
  badminton: calculateBadmintonMetrics,
  cricket: calculateCricketMetrics,
  table_tennis: calculateTableTennisMetrics,
};

/**
 * Get the metric calculator for a specific sport
 * 
 * @param sport - Sport identifier (e.g., 'basketball')
 * @returns The metric calculator function, or null if sport not supported
 */
export function getMetricCalculator(sport: string): SportMetricCalculator | null {
  const calculator = sportMetricRegistry[sport];
  
  if (!calculator) {
    console.warn(`[SportRegistry] No calculator found for sport: ${sport}`);
    return null;
  }
  
  return calculator;
}

/**
 * Calculate metrics for any supported sport
 * 
 * This is the main entry point for the metric engine.
 * It handles sport routing and provides consistent error handling.
 * 
 * @param sport - Sport identifier
 * @param input - Standardized metric calculation input
 * @returns Calculated metrics, or empty object if sport not supported
 */
export function calculateSportMetrics(
  sport: string,
  input: MetricCalculationInput
): MetricResult {
  const calculator = getMetricCalculator(sport);
  
  if (!calculator) {
    console.error(`[SportRegistry] Cannot calculate metrics - unsupported sport: ${sport}`);
    return {};
  }
  
  try {
    const startTime = performance.now();
    const metrics = calculator(input);
    const endTime = performance.now();
    
    console.log(
      `[SportRegistry] Calculated ${sport} metrics in ${(endTime - startTime).toFixed(2)}ms`
    );
    
    return metrics;
  } catch (error) {
    console.error(`[SportRegistry] Error calculating ${sport} metrics:`, error);
    return {};
  }
}

/**
 * Check if a sport is supported by the metric engine
 * 
 * @param sport - Sport identifier to check
 * @returns true if sport has a registered calculator
 */
export function isSportSupported(sport: string): boolean {
  return sport in sportMetricRegistry;
}

/**
 * Get list of all supported sports
 * 
 * @returns Array of sport identifiers
 */
export function getSupportedSports(): string[] {
  return Object.keys(sportMetricRegistry);
}