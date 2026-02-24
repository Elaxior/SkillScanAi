/**
 * Firebase Configuration & Initialization
 * 
 * This module initializes the Firebase SDK and exports
 * database and auth instances for use throughout the app.
 * 
 * Key considerations:
 * - Single initialization (no reinitialization)
 * - Graceful handling of missing config
 * - Anonymous auth for frictionless MVP
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  type Firestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type Auth,
  type User,
  type UserCredential,
} from 'firebase/auth';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Firebase configuration from environment variables
 * All values must be prefixed with NEXT_PUBLIC_ for client-side access
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Validate that all required config values are present
 */
function validateConfig(): boolean {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];

  for (const key of requiredKeys) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
      console.error(`[Firebase] Missing required config: ${key}`);
      return false;
    }
  }

  return true;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

/**
 * Initialize Firebase app
 * Uses singleton pattern to prevent reinitialization
 */
function initializeFirebase(): FirebaseApp | null {
  // Check if already initialized
  if (getApps().length > 0) {
    console.log('[Firebase] Using existing app instance');
    return getApp();
  }

  // Validate configuration
  if (!validateConfig()) {
    console.error('[Firebase] Invalid configuration, skipping initialization');
    return null;
  }

  try {
    const newApp = initializeApp(firebaseConfig);
    console.log('[Firebase] App initialized successfully');
    return newApp;
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
    return null;
  }
}

/**
 * Get Firestore instance
 */
function getFirestoreInstance(): Firestore | null {
  if (!app) {
    app = initializeFirebase();
  }

  if (!app) {
    return null;
  }

  if (!db) {
    db = getFirestore(app);

    // Connect to emulator in development (optional)
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('[Firebase] Connected to Firestore emulator');
    }

    console.log('[Firebase] Firestore initialized');
  }

  return db;
}

/**
 * Get Auth instance
 */
function getAuthInstance(): Auth | null {
  if (!app) {
    app = initializeFirebase();
  }

  if (!app) {
    return null;
  }

  if (!auth) {
    auth = getAuth(app);
    console.log('[Firebase] Auth initialized');
  }

  return auth;
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

/**
 * Sign in anonymously
 * Creates a new anonymous user or uses existing session
 * 
 * @returns User object or null if failed
 */
export async function signInAnonymousUser(): Promise<User | null> {
  const authInstance = getAuthInstance();

  if (!authInstance) {
    console.error('[Firebase] Auth not initialized');
    return null;
  }

  // Check if already signed in
  if (authInstance.currentUser) {
    console.log('[Firebase] User already signed in:', authInstance.currentUser.uid);
    return authInstance.currentUser;
  }

  try {
    const credential = await signInAnonymously(authInstance);
    console.log('[Firebase] Anonymous sign-in successful:', credential.user.uid);
    return credential.user;
  } catch (error) {
    // Downgrade to a non-error log so the console isn't flooded when
    // Anonymous Authentication is disabled in the Firebase project.
    console.warn('[Firebase] Anonymous sign-in unavailable (auth/admin-restricted-operation or similar). Session history disabled.');
    return null;
  }
}

/**
 * Get current user (if signed in)
 */
export function getCurrentUser(): User | null {
  const authInstance = getAuthInstance();
  return authInstance?.currentUser ?? null;
}

/**
 * Subscribe to auth state changes
 * 
 * @param callback - Function called when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const authInstance = getAuthInstance();

  if (!authInstance) {
    console.error('[Firebase] Auth not initialized for state listener');
    return () => { };
  }

  return onAuthStateChanged(authInstance, callback);
}

/**
 * Ensure user is authenticated (anonymous or signed in)
 * Automatically signs in anonymously if not authenticated
 * 
 * @returns User object or null if all auth attempts failed
 */
export async function ensureAuthenticated(): Promise<User | null> {
  const authInstance = getAuthInstance();

  if (!authInstance) {
    return null;
  }

  // Return existing user if available
  if (authInstance.currentUser) {
    return authInstance.currentUser;
  }

  // Attempt anonymous sign-in
  return signInAnonymousUser();
}

// ============================================================================
// EMAIL / PASSWORD AUTH
// ============================================================================

/** Sign in with email + password */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  const authInstance = getAuthInstance();
  if (!authInstance) return { user: null, error: 'Firebase not initialised' };
  try {
    const cred: UserCredential = await signInWithEmailAndPassword(authInstance, email, password);
    return { user: cred.user, error: null };
  } catch (err: any) {
    return { user: null, error: mapAuthError(err.code) };
  }
}

/** Register a new user with email + password (and optional display name) */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<{ user: User | null; error: string | null }> {
  const authInstance = getAuthInstance();
  if (!authInstance) return { user: null, error: 'Firebase not initialised' };
  try {
    const cred: UserCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
    return { user: cred.user, error: null };
  } catch (err: any) {
    return { user: null, error: mapAuthError(err.code) };
  }
}

/** Sign in with Google (popup) */
export async function signInWithGoogle(): Promise<{ user: User | null; error: string | null }> {
  const authInstance = getAuthInstance();
  if (!authInstance) return { user: null, error: 'Firebase not initialised' };
  try {
    const provider = new GoogleAuthProvider();
    const cred: UserCredential = await signInWithPopup(authInstance, provider);
    return { user: cred.user, error: null };
  } catch (err: any) {
    if (err.code === 'auth/popup-closed-by-user') return { user: null, error: null };
    return { user: null, error: mapAuthError(err.code) };
  }
}

/** Sign out the current user */
export async function signOutUser(): Promise<void> {
  const authInstance = getAuthInstance();
  if (!authInstance) return;
  await signOut(authInstance);
}

/** Map Firebase error codes to readable messages */
function mapAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/operation-not-allowed': 'Sign-in method not enabled in Firebase console.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-credential': 'Invalid credentials. Check email and password.',
    'auth/popup-blocked': 'Pop-up was blocked. Please allow pop-ups for this site.',
  };
  return map[code] ?? `Sign-in failed (${code}).`;
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Firestore database instance
 * Use this for all database operations
 */
export const firestore = getFirestoreInstance();

/**
 * Firebase Auth instance
 * Use this for authentication operations
 */
export const firebaseAuth = getAuthInstance();

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return validateConfig() && app !== null;
}

/**
 * Re-export types for convenience
 */
export type { User, Firestore, Auth };