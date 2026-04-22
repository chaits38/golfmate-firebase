// src/auth.js
import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// ── Sign Up ─────────────────────────────────────────────
export async function signUp(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Create user profile document in Firestore
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid:       cred.user.uid,
    name,
    email,
    favorites: [],
    createdAt: serverTimestamp()
  });
  return cred.user;
}

// ── Log In ──────────────────────────────────────────────
export async function logIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ── Log Out ─────────────────────────────────────────────
export async function logOut() {
  await signOut(auth);
}

// ── Auth Guard (call at top of protected pages) ──────────
export function requireAuth(callback) {
  onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.href = '/index.html';
    } else {
      callback(user);
    }
  });
}

// ── Get User Profile from Firestore ─────────────────────
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}
