import { auth as firebaseAuth } from "./firebase";
// Try to import firebase auth functions; they will exist if `firebase` is installed
let firebaseCreateUser: any = null;
let firebaseSignIn: any = null;
let firebaseUpdateProfile: any = null;
let firebaseSignOut: any = null;
let firebaseOnAuthStateChanged: any = null;
let firebaseGetIdTokenResult: any = null;
try {
  // dynamic require to avoid bundling issues on server
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fbAuth = require("firebase/auth");
  firebaseCreateUser = fbAuth.createUserWithEmailAndPassword;
  firebaseSignIn = fbAuth.signInWithEmailAndPassword;
  firebaseUpdateProfile = fbAuth.updateProfile;
  firebaseSignOut = fbAuth.signOut;
  firebaseOnAuthStateChanged = fbAuth.onAuthStateChanged;
  firebaseGetIdTokenResult = fbAuth.getIdTokenResult;
} catch (e) {
  // firebase not available or not configured; we'll use dev fallback
}

type DevUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
};

let devUser: DevUser | null = null;
const subscribers: Array<(u: any) => void> = [];

function notify(u: any) {
  subscribers.forEach((cb) => {
    try {
      cb(u);
    } catch (e) {
      // ignore
    }
  });
}

export function currentUser() {
  return (firebaseAuth && firebaseAuth.currentUser) || devUser;
}

export async function register(email: string, password: string) {
  if (firebaseAuth && firebaseCreateUser) {
    return firebaseCreateUser(firebaseAuth, email, password);
  }
  // dev fallback: create a fake user
  const isSeedAdmin =
    email === process.env.SEED_ADMIN_EMAIL ||
    email === "trandaidung9a1@gmail.com";
  devUser = {
    uid: isSeedAdmin ? `admin-${Date.now()}` : `dev-${Date.now()}`,
    email,
    displayName: isSeedAdmin ? "Admin" : null,
  };
  notify(devUser);
  return { user: devUser };
}

export async function signIn(email: string, password: string) {
  if (firebaseAuth && firebaseSignIn) {
    return firebaseSignIn(firebaseAuth, email, password);
  }
  // dev fallback: accept any credentials
  const isSeedAdmin =
    email === process.env.SEED_ADMIN_EMAIL ||
    email === "trandaidung9a1@gmail.com";
  devUser = {
    uid: isSeedAdmin ? `admin-${Date.now()}` : `dev-${Date.now()}`,
    email,
    displayName: isSeedAdmin ? "Admin" : null,
  };
  notify(devUser);
  return { user: devUser };
}

export async function isAdminUser(u: any) {
  if (!u) return false;
  // If Firebase is available, try to read custom claims from token result
  if (firebaseGetIdTokenResult) {
    try {
      const result = await firebaseGetIdTokenResult(u);
      const claims = result && result.claims;
      if (claims && (claims.role === "admin" || claims.admin === true))
        return true;
    } catch (e) {
      // ignore and fall back to dev checks
    }
  }
  // dev fallback: consider any uid starting with 'admin-' or email matching seed admin as admin
  if (typeof u.uid === "string" && u.uid.startsWith("admin-")) return true;
  if (
    u.email &&
    (u.email === process.env.SEED_ADMIN_EMAIL ||
      u.email === "trandaidung9a1@gmail.com")
  )
    return true;
  return false;
}

export async function updateProfile(user: any, data: { displayName?: string }) {
  if (firebaseAuth && firebaseUpdateProfile) {
    return firebaseUpdateProfile(user, data);
  }
  if (devUser && data.displayName) {
    devUser.displayName = data.displayName;
    notify(devUser);
  }
  return;
}

export function onAuthStateChanged(cb: (u: any) => void) {
  if (firebaseAuth && firebaseOnAuthStateChanged) {
    return firebaseOnAuthStateChanged(firebaseAuth, cb);
  }
  subscribers.push(cb);
  // call immediately with current dev user
  cb(devUser);
  return () => {
    const idx = subscribers.indexOf(cb);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}

export async function signOut() {
  if (firebaseAuth && firebaseSignOut) {
    return firebaseSignOut(firebaseAuth);
  }
  devUser = null;
  notify(null);
}

export default {
  currentUser,
  register,
  signIn,
  updateProfile,
  onAuthStateChanged,
  signOut,
};
