/**
 * Hook for scoring engine integration
 * 
 * Provides a clean React interface for calculating and storing
 * performance scores based on extracted metrics.
 */

import { useCallback, useState } from 'react';
import { useSessionStore, useUserStore } from '@/store';
import { calculateBasketballScore } from '../basketballScoring';
import type { ScoringResult } from '../types';

interface UseScoringEngineResult {
  /** Trigger score calculation */
  calculateScore: () => ScoringResult | null;
  /** Whether calculation is in progress */
  isCalculating: boolean;
  /** Last calculation error, if any */
  error: string | null;
  /** Most recent scoring result */
  lastResult: ScoringResult | null;
}

/**
 * Hook for calculating and storing performance scores
 */
export function useScoringEngine(): UseScoringEngineResult {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ScoringResult | null>(null);
  
  // Get data from stores
  const selectedSport = useUserStore((state) => state.selectedSport);
  const selectedAction = useUserStore((state) => state.selectedAction);
  const metrics = useSessionStore((state) => state.metrics);
  const setScore = useSessionStore((state) => state.setScore);
  const setScoreBreakdown = useSessionStore((state) => state.setScoreBreakdown);
  
  const calculateScore = useCallback((): ScoringResult | null => {
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
    
    if (!metrics || Object.keys(metrics).length === 0) {
      setError('No metrics available for scoring');
      return null;
    }
    
    setIsCalculating(true);
    
    try {
      let result: ScoringResult;
      
      // Route to appropriate sport scoring function
      switch (selectedSport) {
        case 'basketball':
          result = calculateBasketballScore(metrics, selectedAction);
          break;
        
        // TODO: Add other sports as they're implemented
        case 'volleyball':
        case 'badminton':
        case 'cricket':
        case 'table_tennis':
          setError(`Scoring for ${selectedSport} is not yet implemented`);
          setIsCalculating(false);
          return null;
        
        default:
          setError(`Unknown sport: ${selectedSport}`);
          setIsCalculating(false);
          return null;
      }
      
      // Store results
      setScore(result.overallScore);
      setScoreBreakdown(result.breakdown);
      setLastResult(result);
      
      setIsCalculating(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during scoring';
      setError(errorMessage);
      setIsCalculating(false);
      return null;
    }
  }, [selectedSport, selectedAction, metrics, setScore, setScoreBreakdown]);
  
  return {
    calculateScore,
    isCalculating,
    error,
    lastResult,
  };
}