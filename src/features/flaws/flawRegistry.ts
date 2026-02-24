/**
 * Flaw Detection Registry
 * 
 * Central registry for sport-specific flaw detection functions.
 * 
 * Why use a registry pattern?
 * 
 * 1. CLEAN ARCHITECTURE: Separates routing from implementation
 * 2. EXTENSIBILITY: Add new sports without modifying existing code
 * 3. CONSISTENCY: All sports follow the same interface
 * 4. TESTABILITY: Each sport can be tested in isolation
 * 5. LAZY LOADING: Future optimization can dynamically import sports
 */

import type {
  FlawDetectionFunction,
  FlawDetectionInput,
  FlawDetectionResult,
} from './flawTypes';
import { detectBasketballFlaws } from './basketballFlaws';
import { detectVolleyballFlaws } from './volleyballFlaws';
import { detectBadmintonFlaws } from './badmintonFlaws';

// ============================================================================
// REGISTRY
// ============================================================================

/**
 * Map of sport identifiers to their flaw detection functions
 * 
 * Keys must match the Sport enum values from src/types/sport.ts
 */
export const flawRegistry: Record<string, FlawDetectionFunction> = {
  basketball: detectBasketballFlaws,
  volleyball: detectVolleyballFlaws,
  badminton: detectBadmintonFlaws,
};

/**
 * Get the flaw detection function for a specific sport
 * 
 * @param sport - Sport identifier
 * @returns Detection function or null if not supported
 */
export function getFlawDetector(sport: string): FlawDetectionFunction | null {
  const detector = flawRegistry[sport];

  if (!detector) {
    console.warn(`[FlawRegistry] No detector found for sport: ${sport}`);
    return null;
  }

  return detector;
}

/**
 * Detect flaws for any supported sport
 * 
 * This is the main entry point for flaw detection.
 * It routes to the appropriate sport-specific detector.
 * 
 * @param sport - Sport identifier
 * @param input - Detection input data
 * @returns Detection result or empty result if sport not supported
 */
export function detectFlaws(
  sport: string,
  input: FlawDetectionInput
): FlawDetectionResult {
  const detector = getFlawDetector(sport);

  if (!detector) {
    return {
      flaws: [],
      rulesEvaluated: 0,
      overallInjuryRisk: 'none',
      summary: `Flaw detection for ${sport} is not supported.`,
    };
  }

  try {
    const startTime = performance.now();
    const result = detector(input);
    const endTime = performance.now();

    console.log(
      `[FlawRegistry] Detected ${result.flaws.length} flaws in ${(endTime - startTime).toFixed(2)}ms`
    );

    return result;
  } catch (error) {
    console.error(`[FlawRegistry] Error detecting flaws for ${sport}:`, error);
    return {
      flaws: [],
      rulesEvaluated: 0,
      overallInjuryRisk: 'none',
      summary: 'An error occurred during flaw detection.',
    };
  }
}

/**
 * Check if flaw detection is supported for a sport
 */
export function isFlawDetectionSupported(sport: string): boolean {
  return sport in flawRegistry;
}

/**
 * Get list of sports with flaw detection support
 */
export function getSupportedSportsForFlaws(): string[] {
  return Object.keys(flawRegistry);
}