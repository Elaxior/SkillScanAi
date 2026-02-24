/**
 * Hook for managing session history
 * 
 * Provides loading, fetching, and saving functionality
 * with proper error handling and loading states.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchUserSessions } from '../fetchSessions';
import { saveSession, prepareSessionData } from '../saveSession';
import { calculateProgressStats, sessionsToChartData } from '../improvementUtils';
import type { SessionDisplay, ProgressStats, ChartDataPoint } from '../types';

interface UseSessionHistoryResult {
  // Data
  sessions: SessionDisplay[];
  stats: ProgressStats;
  chartData: ChartDataPoint[];

  // State
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveError: string | null;

  // Actions
  refreshSessions: () => Promise<void>;
  saveCurrentSession: (
    sport: string,
    action: string,
    score: number,
    breakdown: Record<string, number>,
    metrics: Record<string, number | null>,
    flawCount: number,
    hasInjuryRisk: boolean
  ) => Promise<boolean>;
}

export function useSessionHistory(): UseSessionHistoryResult {
  const [sessions, setSessions] = useState<SessionDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Calculate derived data
  const stats = calculateProgressStats(sessions);
  const chartData = sessionsToChartData(sessions);

  // Fetch sessions
  const refreshSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchUserSessions();

      if (result.success) {
        setSessions(result.sessions);
      } else {
        // Silently degrade when Firebase is not fully configured
        const isConfigError =
          result.error?.includes('admin-restricted-operation') ||
          result.error?.includes('auth') ||
          result.error?.includes('Firebase') ||
          result.error?.includes('permissions') ||
          result.error?.includes('index') ||
          result.error?.includes('Missing or insufficient');
        if (!isConfigError) {
          setError(result.error);
        }
        setSessions([]);
      }
    } catch (err) {
      // Ignore Firebase auth/config errors entirely to avoid console spam
      const msg = err instanceof Error ? err.message : String(err);
      const isConfigError =
        msg.includes('admin-restricted-operation') ||
        msg.includes('auth') ||
        msg.includes('Firebase') ||
        msg.includes('permissions') ||
        msg.includes('index') ||
        msg.includes('Missing or insufficient');
      if (!isConfigError) {
        setError(msg);
      }
      setSessions([]);
    }

    setIsLoading(false);
  }, []);

  // Save current session
  const saveCurrentSession = useCallback(async (
    sport: string,
    action: string,
    score: number,
    breakdown: Record<string, number>,
    metrics: Record<string, number | null>,
    flawCount: number,
    hasInjuryRisk: boolean
  ): Promise<boolean> => {
    setIsSaving(true);
    setSaveError(null);

    const sessionData = prepareSessionData(
      sport,
      action,
      score,
      breakdown,
      metrics,
      flawCount,
      hasInjuryRisk
    );

    const result = await saveSession(sessionData);

    if (result.success) {
      // Refresh sessions to include new one
      await refreshSessions();
    } else {
      setSaveError(result.error);
    }

    setIsSaving(false);
    return result.success;
  }, [refreshSessions]);

  // Initial load
  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  return {
    sessions,
    stats,
    chartData,
    isLoading,
    isSaving,
    error,
    saveError,
    refreshSessions,
    saveCurrentSession,
  };
}