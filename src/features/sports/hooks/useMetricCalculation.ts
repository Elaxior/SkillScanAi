/**
 * Hook for metric calculation integration
 * 
 * This hook bridges the sport metric engine with React components,
 * providing a clean interface for triggering calculations and
 * storing results in the session store.
 */

import { useCallback, useState } from 'react';
import { useSessionStore } from '@/store';
import { useUserStore } from '@/store';
import { calculateSportMetrics, isSportSupported } from '../sportRegistry';
import type { MetricResult } from '../types';

interface UseMetricCalculationResult {
  /** Trigger metric calculation */
  calculateMetrics: () => MetricResult | null;
  /** Whether calculation is in progress */
  isCalculating: boolean;
  /** Last calculation error, if any */
  error: string | null;
  /** Whether the selected sport is supported */
  isSportSupported: boolean;
}

/**
 * Hook for calculating and storing sport-specific metrics
 * 
 * Usage:
 * ```tsx
 * const { calculateMetrics, isCalculating, error } = useMetricCalculation();
 * 
 * const handleAnalyze = () => {
 *   const metrics = calculateMetrics();
 *   if (metrics) {
 *     console.log('Analysis complete:', metrics);
 *   }
 * };
 * ```
 */
export function useMetricCalculation(): UseMetricCalculationResult {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get data from stores
  const selectedSport = useUserStore((state) => state.selectedSport);
  const selectedAction = useUserStore((state) => state.selectedAction);
  const smoothedLandmarks = useSessionStore((state) => state.smoothedLandmarks);
  const smoothedFrames = smoothedLandmarks.map((f) => f.landmarks);
  const keyframes = useSessionStore((state) => state.keyframes);
  const fps = useSessionStore((state) => state.fps);
  const setMetrics = useSessionStore((state) => state.setMetrics);
  
  const sportSupported = isSportSupported(selectedSport || '');
  
  const calculateMetrics = useCallback((): MetricResult | null => {
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
    
    if (!sportSupported) {
      setError(`Sport "${selectedSport}" is not supported`);
      return null;
    }
    
    if (!smoothedFrames || smoothedFrames.length === 0) {
      setError('No pose data available. Please process a video first.');
      return null;
    }
    
    if (!fps || fps <= 0) {
      setError('Invalid FPS. Please re-process the video.');
      return null;
    }
    
    setIsCalculating(true);
    
    try {
      const metrics = calculateSportMetrics(selectedSport, {
        smoothedFrames,
        keyframes,
        fps,
        action: selectedAction,
      });
      
      // Store metrics in session
      setMetrics(metrics);
      
      setIsCalculating(false);
      return metrics;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during calculation';
      setError(errorMessage);
      setIsCalculating(false);
      return null;
    }
  }, [
    selectedSport,
    selectedAction,
    sportSupported,
    smoothedFrames,
    keyframes,
    fps,
    setMetrics,
  ]);
  
  return {
    calculateMetrics,
    isCalculating,
    error,
    isSportSupported: sportSupported,
  };
}