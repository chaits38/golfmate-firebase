// src/db.js — Firestore CRUD helpers
import { db } from './firebase.js';
import {
  collection, doc, addDoc, getDoc, getDocs,
  query, where, orderBy, limit, deleteDoc,
  updateDoc, arrayUnion, arrayRemove,
  serverTimestamp, Timestamp
} from 'firebase/firestore';

// ═══ COURSES ════════════════════════════════════════════

export async function getCourses(searchTerm = '') {
  const snap = await getDocs(collection(db, 'courses'));
  const all  = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (!searchTerm) return all;
  const term = searchTerm.toLowerCase();
  return all.filter(c =>
    c.courseName.toLowerCase().includes(term) ||
    (c.location || '').toLowerCase().includes(term)
  );
}

export async function getCourse(courseId) {
  const snap = await getDoc(doc(db, 'courses', courseId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addCourse(data) {
  const ref = await addDoc(collection(db, 'courses'), data);
  return ref.id;
}

// ═══ FAVORITES ══════════════════════════════════════════

export async function addFavorite(uid, courseId) {
  await updateDoc(doc(db, 'users', uid), {
    favorites: arrayUnion(courseId)
  });
}

export async function removeFavorite(uid, courseId) {
  await updateDoc(doc(db, 'users', uid), {
    favorites: arrayRemove(courseId)
  });
}

// ═══ ROUNDS ═════════════════════════════════════════════

export async function saveRound(uid, roundData, holesData) {
  // 1. Calculate totals
  const totalScore = holesData.reduce((s, h) => s + h.strokes, 0);
  const totalPutts = holesData.reduce((s, h) => s + (h.putts || 0), 0);

  // 2. Save the round document
  const roundRef = await addDoc(collection(db, 'rounds'), {
    userId:     uid,
    courseId:   roundData.courseId,
    datePlayed: Timestamp.fromDate(new Date(roundData.datePlayed)),
    totalScore,
    totalPutts,
    penalties:  roundData.penalties || 0,
    createdAt:  serverTimestamp()
  });

  // 3. Save each hole as a sub-document
  for (const hole of holesData) {
    await addDoc(collection(db, 'rounds', roundRef.id, 'holes'), {
      holeNumber:        hole.holeNumber,
      strokes:           hole.strokes,
      putts:             hole.putts || 0,
      fairwayHit:        hole.fairwayHit || false,
      greenInRegulation: hole.greenInRegulation || false
    });
  }
  return roundRef.id;
}

export async function getRoundHistory(uid) {
  const q    = query(
    collection(db, 'rounds'),
    where('userId', '==', uid),
    orderBy('datePlayed', 'desc')
  );
  const snap = await getDocs(q);
  const rounds = [];
  for (const d of snap.docs) {
    const round  = { id: d.id, ...d.data() };
    const course = await getCourse(round.courseId);
    round.courseName = course?.courseName || 'Unknown';
    round.par        = course?.par || 72;
    rounds.push(round);
  }
  return rounds;
}

export async function getRound(roundId) {
  const snap = await getDoc(doc(db, 'rounds', roundId));
  if (!snap.exists()) return null;
  const round = { id: snap.id, ...snap.data() };
  const holesSnap = await getDocs(
    query(collection(db, 'rounds', roundId, 'holes'), orderBy('holeNumber'))
  );
  round.holes = holesSnap.docs.map(d => d.data());
  return round;
}

export async function deleteRound(roundId) {
  await deleteDoc(doc(db, 'rounds', roundId));
}
