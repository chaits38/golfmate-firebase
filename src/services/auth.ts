import { auth, db } from '@/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import type { UserProfile } from '@/types'

export async function signUp(name: string, email: string, password: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid:       cred.user.uid,
    name,
    email,
    favorites: [],
    createdAt: serverTimestamp()
  })
  return cred.user
}

export async function logIn(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function logOut(): Promise<void> {
  await signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export function friendlyAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found':     'No account found with that email.',
    'auth/wrong-password':     'Incorrect password.',
    'auth/invalid-email':      'Please enter a valid email.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests':  'Too many attempts. Try again later.',
    'auth/email-already-in-use': 'An account with that email already exists.',
    'auth/weak-password':      'Password must be at least 6 characters.'
  }
  return map[code] ?? 'Authentication failed. Please try again.'
}
