// Firebase Auth Wrapper
// Provides all authentication operations using Firebase Auth SDK.
// On success, returns a standardized { user, token } response.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  getIdToken,
} from 'firebase/auth';

import { auth, googleProvider } from './firebase';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Admin email whitelist — used in mock/dev mode only.
 * In production (PHP/MySQL backend), role is fetched from the users table.
 * Add any email here that should have admin access during development.
 */
const ADMIN_EMAILS = [
  'admin@tsttools.com',
  'azmatfaiz9756@gmail.com', // Firebase account owner always admin
];

/** Convert a Firebase User object to our app's standard user shape */
function normalizeUser(fbUser) {
  const email = fbUser.email || '';
  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
  return {
    id:            fbUser.uid,
    uid:           fbUser.uid,
    email:         email,
    name:          fbUser.displayName || email.split('@')[0] || 'User',
    photoURL:      fbUser.photoURL || null,
    emailVerified: fbUser.emailVerified,
    role:          isAdmin ? 'admin' : 'user',
    created_date:  fbUser.metadata?.creationTime || new Date().toISOString(),
  };
}

/** Map Firebase error codes to human-readable messages */
function mapFirebaseError(code) {
  const map = {
    'auth/email-already-in-use':   'This email is already registered. Please sign in.',
    'auth/invalid-email':          'Invalid email address format.',
    'auth/weak-password':          'Password must be at least 6 characters.',
    'auth/user-not-found':         'No account found with this email.',
    'auth/wrong-password':         'Incorrect password. Please try again.',
    'auth/too-many-requests':      'Too many failed attempts. Please try again later.',
    'auth/popup-closed-by-user':   'Sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/user-disabled':          'This account has been disabled. Contact support.',
    'auth/invalid-credential':     'Invalid credentials. Please check your email and password.',
  };
  return map[code] || 'Authentication failed. Please try again.';
}

// ─── Auth Functions ───────────────────────────────────────────────────────────

/**
 * Register a new user with email + password.
 * Optionally sets a display name.
 */
export async function registerWithEmail({ email, password, name }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(credential.user, { displayName: name });
  }
  const token = await getIdToken(credential.user);
  return { user: normalizeUser(credential.user), token };
}

/**
 * Sign in with email + password.
 */
export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const token = await getIdToken(credential.user);
  return { user: normalizeUser(credential.user), token };
}

/**
 * Sign in with Google (popup).
 */
export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const token = await getIdToken(credential.user);
  return { user: normalizeUser(credential.user), token };
}

/**
 * Sign out the current user.
 */
export async function logout() {
  await signOut(auth);
}

/**
 * Send a password reset email.
 */
export async function sendResetEmail(email) {
  await sendPasswordResetEmail(auth, email);
  return { success: true };
}

/**
 * Get the current Firebase ID token (refreshed if needed).
 * Returns null if no user is logged in.
 */
export async function getCurrentIdToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return getIdToken(user, /* forceRefresh */ false);
}

/**
 * Subscribe to auth state changes.
 * Callback receives normalized user object or null.
 * Returns the unsubscribe function.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      callback(normalizeUser(fbUser));
    } else {
      callback(null);
    }
  });
}

/**
 * Get current normalized user synchronously (may be null before Firebase loads).
 */
export function getCurrentUser() {
  const fbUser = auth.currentUser;
  return fbUser ? normalizeUser(fbUser) : null;
}

export { mapFirebaseError };
