/**
 * Demo Mode Hook
 * 
 * Manages demo mode state and provides functions for
 * loading precomputed demo data into the session store.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSessionStore, useUserStore } from '@/store';
import type { PoseFrame } from '@/features/pose';
import {
  DEMO_SESSION,
  DEMO_VIDEO_URL,
  DEMO_VIDEO_METADATA,
  generateDemoLandmarks,
  DEMO_KEYFRAMES,
  DEMO_METRICS,
  DEMO_SCORE,
  DEMO_SCORE_BREAKDOWN,
  DEMO_CONFIDENCE,
  DEMO_FLAWS,
} from './demoData';

// ============================================================================
// TYPES
// ============================================================================

interface UseDemoModeResult {
  /** Whether demo mode is enabled */
  demoMode: boolean;
  /** Toggle demo mode on/off */
  setDemoMode: (enabled: boolean) => void;
  /** Load demo data into session store */
  loadDemoData: () => void;
  /** Check if current session is demo data */
  isDemoSession: boolean;
  /** Demo mode status message */
  statusMessage: string;
}

// ============================================================================
// LOCAL STORAGE KEY
// ============================================================================

const DEMO_MODE_KEY = 'skillscan-demo-mode';

// ============================================================================
// HOOK
// ============================================================================

export function useDemoMode(): UseDemoModeResult {
  const [demoMode, setDemoModeState] = useState(false);
  const [isDemoSession, setIsDemoSession] = useState(false);

  // Session store actions
  const setVideo = useSessionStore((s) => s.setVideo);
  const setFps = useSessionStore((s) => s.setFps);
  const setLandmarks = useSessionStore((s) => s.setLandmarks);
  const setSmoothedLandmarks = useSessionStore((s) => s.setSmoothedLandmarks);
  const setKeyframes = useSessionStore((s) => s.setKeyframes);
  const setMetrics = useSessionStore((s) => s.setMetrics);
  const setScore = useSessionStore((s) => s.setScore);
  const setScoreBreakdown = useSessionStore((s) => s.setScoreBreakdown);
  const setScoreWithDetails = useSessionStore((s) => s.setScoreWithDetails);
  const setFlaws = useSessionStore((s) => s.setFlaws);

  // User store actions
  const setSport = useUserStore((s) => s.setSport);
  const setAction = useUserStore((s) => s.setAction);

  // Current video URL to check if demo
  const currentVideoUrl = useSessionStore((s) => s.video.url);

  // Load initial state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DEMO_MODE_KEY);
      if (stored === 'true') {
        setDemoModeState(true);
      }
    }
  }, []);

  // Check if current session is demo
  useEffect(() => {
    setIsDemoSession(currentVideoUrl === DEMO_VIDEO_URL);
  }, [currentVideoUrl]);

  // Toggle demo mode
  const setDemoMode = useCallback((enabled: boolean) => {
    setDemoModeState(enabled);

    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_MODE_KEY, enabled ? 'true' : 'false');
    }

    console.log('[DemoMode]', enabled ? 'Enabled' : 'Disabled');
  }, []);

  // Load demo data into stores
  const loadDemoData = useCallback(() => {
    console.log('[DemoMode] Loading demo data...');

    // Set sport/action
    setSport(DEMO_VIDEO_METADATA.sport);
    setAction(DEMO_VIDEO_METADATA.action);

    // Set video (url + metadata in one call)
    setVideo(DEMO_VIDEO_URL, {
      duration: DEMO_VIDEO_METADATA.duration,
      fps: DEMO_VIDEO_METADATA.fps,
    });
    setFps(DEMO_VIDEO_METADATA.fps);

    // Convert NormalizedLandmark[][] -> PoseFrame[] for store
    const rawLandmarks = generateDemoLandmarks();
    const demoFrames: PoseFrame[] = rawLandmarks.map((landmarks, i) => ({
      frameNumber: i,
      timestamp: i / DEMO_VIDEO_METADATA.fps,
      landmarks,
      confidence: 0.95,
    }));
    setLandmarks(demoFrames);
    setSmoothedLandmarks(demoFrames);
    setKeyframes(DEMO_KEYFRAMES);

    // Set metrics and score
    setMetrics(DEMO_METRICS);
    setScoreWithDetails(DEMO_SCORE, DEMO_SCORE_BREAKDOWN, DEMO_CONFIDENCE);

    // Set flaws
    setFlaws(DEMO_FLAWS);

    setIsDemoSession(true);

    console.log('[DemoMode] Demo data loaded successfully');
  }, [
    setSport,
    setAction,
    setVideo,
    setFps,
    setLandmarks,
    setSmoothedLandmarks,
    setKeyframes,
    setMetrics,
    setScoreWithDetails,
    setFlaws,
  ]);

  // Generate status message
  const statusMessage = demoMode
    ? isDemoSession
      ? 'Viewing demo results'
      : 'Demo mode enabled - Click "Load Demo" to see sample results'
    : '';

  return {
    demoMode,
    setDemoMode,
    loadDemoData,
    isDemoSession,
    statusMessage,
  };
}

/**
 * Simple hook to just check demo mode status
 */
export function useIsDemoMode(): boolean {
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DEMO_MODE_KEY);
      setDemoMode(stored === 'true');
    }
  }, []);

  return demoMode;
}