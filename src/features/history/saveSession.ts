/**
 * Save Session to Firestore
 * 
 * Handles persisting session analysis results to the database.
 */

import {
  collection,
  addDoc,
  serverTimestamp,
  type DocumentReference,
} from 'firebase/firestore';
import { firestore, ensureAuthenticated } from '@/lib/firebase';
import type { SessionData } from './types';

/**
 * Result of save operation
 */
export interface SaveSessionResult {
  success: boolean;
  sessionId: string | null;
  error: string | null;
}

/**
 * Save a session to Firestore
 * 
 * @param sessionData - The session data to save
 * @returns Result object with success status and session ID
 */
export async function saveSession(
  sessionData: Omit<SessionData, 'userId' | 'clientTimestamp'>
): Promise<SaveSessionResult> {
  // Check if Firestore is available
  if (!firestore) {
    console.error('[SaveSession] Firestore not initialized');
    return {
      success: false,
      sessionId: null,
      error: 'Database not available. Please check your connection.',
    };
  }

  try {
    // Ensure user is authenticated
    const user = await ensureAuthenticated();

    if (!user) {
      console.error('[SaveSession] Authentication failed');
      return {
        success: false,
        sessionId: null,
        error: 'Authentication required. Please refresh and try again.',
      };
    }

    // Prepare document data
    // Firestore rejects `undefined` values, so strip them out.
    const rawData = {
      ...sessionData,
      userId: user.uid,
      clientTimestamp: Date.now(),
      createdAt: serverTimestamp(),
    };
    const documentData = Object.fromEntries(
      Object.entries(rawData).filter(([, v]) => v !== undefined)
    );

    // Save to Firestore
    const sessionsRef = collection(firestore, 'sessions');
    const docRef: DocumentReference = await addDoc(sessionsRef, documentData);

    console.log('[SaveSession] Session saved successfully:', docRef.id);

    return {
      success: true,
      sessionId: docRef.id,
      error: null,
    };
  } catch (error) {
    console.error('[SaveSession] Error saving session:', error);

    // Handle specific Firebase errors
    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while saving.';

    return {
      success: false,
      sessionId: null,
      error: errorMessage,
    };
  }
}

/**
 * Prepare session data from store values
 * Helper function to create the session data object
 */
export function prepareSessionData(
  sport: string,
  action: string,
  score: number,
  breakdown: Record<string, number>,
  metrics: Record<string, number | null>,
  flawCount: number,
  hasInjuryRisk: boolean,
  duration?: number
): Omit<SessionData, 'userId' | 'clientTimestamp'> {
  return {
    sport,
    action,
    score,
    breakdown: { ...breakdown }, // Clone to prevent mutations
    metrics: { ...metrics },
    flawCount,
    hasInjuryRisk,
    duration,
  };
}