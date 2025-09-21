import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Analytics is browser-only; import dynamically to avoid SSR issues
let analytics: import("firebase/analytics").Analytics | undefined;

// Minimal contract:
// - Inputs: env vars NEXT_PUBLIC_FIREBASE_... set in Next.js env
// - Outputs: initialized firebase app, auth, firestore, storage
// - Error modes: throws when missing required env vars

function getFirebaseConfig() {
  const {
    NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  } = process.env as Record<string, string | undefined>;

  // If required env vars are missing, return null so the caller can decide
  // to skip initialization instead of throwing and crashing the dev server.
  if (
    !NEXT_PUBLIC_FIREBASE_API_KEY ||
    !NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    !NEXT_PUBLIC_FIREBASE_APP_ID
  ) {
    return null;
  }

  return {
    apiKey: NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

// Initialize Firebase only when config is available
let firebaseApp: FirebaseApp | null = null;
const _config = getFirebaseConfig();
if (_config) {
  if (!getApps().length) {
    firebaseApp = initializeApp(_config);
  } else {
    firebaseApp = getApp();
  }
} else {
  // In development it's helpful to warn instead of throwing so the app can run
  // without Firebase configured. Many pages fall back to mock data when auth is
  // not available.
  // eslint-disable-next-line no-console
  console.warn(
    "Firebase not configured: NEXT_PUBLIC_FIREBASE_* env vars are missing. Some features will be disabled."
  );
}

// Expose auth/firestore/storage. When firebaseApp is not initialized we provide
// safe fallbacks (null or minimal stubs) so client-side code can check for
// auth.currentUser and avoid crashes.
const auth: any = firebaseApp ? getAuth(firebaseApp) : null;
const firestore: any = firebaseApp ? getFirestore(firebaseApp) : null;
const storage: any = firebaseApp ? getStorage(firebaseApp) : null;

// Initialize analytics only in browser environment and if measurementId is present
if (typeof window !== "undefined") {
  try {
    // dynamic import to keep analytics out of server bundles
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    import("firebase/analytics").then(({ getAnalytics }) => {
      try {
        if (firebaseApp) {
          analytics = getAnalytics(firebaseApp as FirebaseApp);
        }
      } catch (e) {
        // analytics may fail if measurementId not set or user blocks it — ignore
        // console.debug('Firebase analytics not initialized', e)
      }
    });
  } catch (e) {
    // ignore — dynamic import failed
  }
}

export { firebaseApp as firebase, auth, firestore, storage, analytics };
