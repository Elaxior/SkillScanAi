/**
 * Hook for flaw detection integration
 * 
 * Provides a clean React interface for detecting flaws
 * and storing results in the session store.
 */

import { useCallback, useState } from 'react';
import { useSessionStore, useUserStore } from '@/store';
import { detectFlaws } from './flawRegistry';
import type { FlawDetectionResult, DetectedFlaw } from './flawTypes';

interface UseFlawDetectionResult {
  /** Trigger flaw detection */
  detectFlawsFromMetrics: () => FlawDetectionResult | null;
  /** Whether detection is in progress */
  isDetecting: boolean;
  /** Last detection error, if any */
  error: string | null;
  /** Most recent detection result */
  lastResult: FlawDetectionResult | null;
  /** Flaws from session store */
  flaws: DetectedFlaw[];
  /** Whether any injury risks are present */
  hasInjuryRisks: boolean;
}

/**
 * Hook for detecting and storing technique flaws
 */
export function useFlawDetection(): UseFlawDetectionResult {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<FlawDetectionResult | null>(null);

  // Get data from stores
  const selectedSport = useUserStore((state) => state.selectedSport);
  const selectedAction = useUserStore((state) => state.selectedAction);
  const metrics = useSessionStore((state) => state.metrics);
  const scoreBreakdown = useSessionStore((state) => state.scoreBreakdown);
  const keyframes = useSessionStore((state) => state.keyframes);
  const flaws = useSessionStore((state) => state.flaws);
  const setFlaws = useSessionStore((state) => state.setFlaws);

  // Check for injury risks
  const hasInjuryRisks = flaws.some((flaw) => flaw.injuryRisk);

  const detectFlawsFromMetrics = useCallback((): FlawDetectionResult | null => {
    setError(null);

    // Validate prerequisites
    if (!selectedSport) {
      setError('No sport selected');
      return null;
    }

    if (!selectedAction) {
      setError('No action selected');
      return null;
    }

    // Read fresh values from store to avoid stale closure
    const storeState = useSessionStore.getState();
    const currentMetrics = storeState.metrics;
    const currentScoreBreakdown = storeState.scoreBreakdown;
    const currentKeyframes = storeState.keyframes;

    if (!currentMetrics || Object.keys(currentMetrics).length === 0) {
      setError('No metrics available for flaw detection');
      return null;
    }

    setIsDetecting(true);

    try {
      const result = detectFlaws(selectedSport, {
        metrics: currentMetrics,
        scoreBreakdown: currentScoreBreakdown,
        keyframes: currentKeyframes,
        action: selectedAction,
      });

      // Store flaws directly — store now accepts DetectedFlaw[]
      setFlaws(result.flaws);
      setLastResult(result);

      setIsDetecting(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during detection';
      setError(errorMessage);
      setIsDetecting(false);
      return null;
    }
  }, [
    selectedSport,
    selectedAction,
    setFlaws,
  ]);

  return {
    detectFlawsFromMetrics,
    isDetecting,
    error,
    lastResult,
    flaws,
    hasInjuryRisks,
  };
}