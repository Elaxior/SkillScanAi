/**
 * History & Session Types
 * 
 * Defines the data structures for session storage and retrieval.
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * Session data to be saved to Firestore
 * 
 * Why we store summary only (not raw frames):
 * 1. STORAGE COST: Raw landmark data = ~100KB/session vs ~1KB summary
 * 2. QUERY SPEED: Smaller documents = faster reads
 * 3. PRIVACY: Less biometric data stored
 * 4. SUFFICIENT: Progress tracking only needs scores and metrics
 * 5. REGENERABLE: If needed, user can re-record and re-analyze
 */
export interface SessionData {
  /** User ID (anonymous or authenticated) */
  userId: string;
  /** Sport analyzed */
  sport: string;
  /** Action analyzed (e.g., 'jump_shot') */
  action: string;
  /** Overall performance score (0-100) */
  score: number;
  /** Score breakdown by metric */
  breakdown: Record<string, number>;
  /** Raw metric values */
  metrics: Record<string, number | null>;
  /** Number of flaws detected */
  flawCount: number;
  /** Whether any injury risks were detected */
  hasInjuryRisk: boolean;
  /** Session duration in seconds */
  duration?: number;
  /** Client timestamp (for offline support) */
  clientTimestamp: number;
}

/**
 * Session document as stored in Firestore
 */
export interface SessionDocument extends SessionData {
  /** Firestore document ID */
  id: string;
  /** Server timestamp */
  createdAt: Timestamp;
}

/**
 * Session for display (with parsed date)
 */
export interface SessionDisplay {
  id: string;
  userId: string;
  sport: string;
  action: string;
  score: number;
  breakdown: Record<string, number>;
  metrics: Record<string, number | null>;
  flawCount: number;
  hasInjuryRisk: boolean;
  duration?: number;
  createdAt: Date;
}

/**
 * Progress statistics
 */
export interface ProgressStats {
  /** Total sessions recorded */
  totalSessions: number;
  /** Average score across all sessions */
  averageScore: number;
  /** Best score achieved */
  bestScore: number;
  /** Most recent score */
  latestScore: number;
  /** Score improvement from first to latest */
  overallImprovement: number;
  /** Improvement in last 7 days */
  weeklyImprovement: number;
  /** Score trend (positive, negative, stable) */
  trend: 'improving' | 'declining' | 'stable';
  /** Sessions in last 7 days */
  sessionsThisWeek: number;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  date: string;
  score: number;
  sessionId: string;
}