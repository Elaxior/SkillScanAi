/**
 * Fetch Sessions from Firestore
 * 
 * Retrieves user's session history for progress tracking.
 */

import {
  collection,
  query,
  where,
  limit,
  getDocs,
  type QuerySnapshot,
  type DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { firestore, getCurrentUser, ensureAuthenticated } from '@/lib/firebase';
import type { SessionDocument, SessionDisplay } from './types';

/**
 * Result of fetch operation
 */
export interface FetchSessionsResult {
  success: boolean;
  sessions: SessionDisplay[];
  error: string | null;
}

/**
 * Convert Firestore document to SessionDisplay
 */
function documentToSession(
  id: string,
  data: DocumentData
): SessionDisplay {
  // Handle Firestore Timestamp
  let createdAt: Date;
  if (data.createdAt instanceof Timestamp) {
    createdAt = data.createdAt.toDate();
  } else if (data.clientTimestamp) {
    createdAt = new Date(data.clientTimestamp);
  } else {
    createdAt = new Date();
  }

  return {
    id,
    userId: data.userId || '',
    sport: data.sport || 'basketball',
    action: data.action || 'jump_shot',
    score: data.score || 0,
    breakdown: data.breakdown || {},
    metrics: data.metrics || {},
    flawCount: data.flawCount || 0,
    hasInjuryRisk: data.hasInjuryRisk || false,
    duration: data.duration,
    createdAt,
  };
}

/**
 * Fetch all sessions for the current user
 * 
 * @param maxSessions - Maximum number of sessions to fetch (default: 50)
 * @returns Result object with sessions array
 */
export async function fetchUserSessions(
  maxSessions: number = 50
): Promise<FetchSessionsResult> {
  // Check if Firestore is available
  if (!firestore) {
    console.error('[FetchSessions] Firestore not initialized');
    return {
      success: false,
      sessions: [],
      error: 'Database not available.',
    };
  }

  try {
    // Ensure user is authenticated
    const user = await ensureAuthenticated();

    if (!user) {
      console.error('[FetchSessions] No authenticated user');
      return {
        success: false,
        sessions: [],
        error: 'Please sign in to view your history.',
      };
    }

    // Build query — no orderBy to avoid needing a composite Firestore index;
    // we sort client-side after fetching.
    const sessionsRef = collection(firestore, 'sessions');
    const sessionsQuery = query(
      sessionsRef,
      where('userId', '==', user.uid),
      limit(maxSessions)
    );

    // Execute query
    const snapshot: QuerySnapshot = await getDocs(sessionsQuery);

    // Convert and sort by createdAt descending (newest first)
    const sessions: SessionDisplay[] = snapshot.docs
      .map((doc) => documentToSession(doc.id, doc.data()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log('[FetchSessions] Fetched', sessions.length, 'sessions');

    return {
      success: true,
      sessions,
      error: null,
    };
  } catch (error) {
    console.warn('[FetchSessions] Error fetching sessions:', error);

    // Check for index error (common first-time setup issue)
    const errorMessage = error instanceof Error
      ? error.message.includes('index')
        ? 'Database index required. Please wait a moment and try again.'
        : error.message
      : 'Failed to load session history.';

    return {
      success: false,
      sessions: [],
      error: errorMessage,
    };
  }
}

/**
 * Fetch sessions for a specific sport
 * 
 * @param sport - Sport to filter by
 * @param maxSessions - Maximum sessions to fetch
 */
export async function fetchSessionsBySport(
  sport: string,
  maxSessions: number = 50
): Promise<FetchSessionsResult> {
  if (!firestore) {
    return {
      success: false,
      sessions: [],
      error: 'Database not available.',
    };
  }

  try {
    const user = await ensureAuthenticated();

    if (!user) {
      return {
        success: false,
        sessions: [],
        error: 'Please sign in to view your history.',
      };
    }

    const sessionsRef = collection(firestore, 'sessions');
    const sessionsQuery = query(
      sessionsRef,
      where('userId', '==', user.uid),
      where('sport', '==', sport),
      limit(maxSessions)
    );

    const snapshot = await getDocs(sessionsQuery);
    const sessions = snapshot.docs
      .map((doc) => documentToSession(doc.id, doc.data()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      success: true,
      sessions,
      error: null,
    };
  } catch (error) {
    console.error('[FetchSessions] Error:', error);
    return {
      success: false,
      sessions: [],
      error: 'Failed to load sessions.',
    };
  }
}

/**
 * Fetch recent sessions (last N days)
 * 
 * @param days - Number of days to look back
 */
export async function fetchRecentSessions(
  days: number = 7
): Promise<FetchSessionsResult> {
  const result = await fetchUserSessions(100);

  if (!result.success) {
    return result;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentSessions = result.sessions.filter(
    (session) => session.createdAt >= cutoffDate
  );

  return {
    success: true,
    sessions: recentSessions,
    error: null,
  };
}