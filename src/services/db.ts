import { db } from '@/firebase'
import {
  collection, doc, addDoc, getDoc, getDocs,
  query, where, orderBy, deleteDoc,
  updateDoc, arrayUnion, arrayRemove,
  serverTimestamp, Timestamp
} from 'firebase/firestore'
import type { Course, NewCourseData, Round, RoundWithHoles, NewRoundData, HoleInput, LeaderboardEntry } from '@/types'

// ═══ COURSES ════════════════════════════════════════════════════

export async function getCourses(searchTerm = ''): Promise<Course[]> {
  const snap = await getDocs(collection(db, 'courses'))
  const all  = snap.docs.map(d => ({ id: d.id, ...d.data() } as Course))
  if (!searchTerm) return all
  const term = searchTerm.toLowerCase()
  return all.filter(c =>
    c.courseName.toLowerCase().includes(term) ||
    (c.location ?? '').toLowerCase().includes(term)
  )
}

export async function getCourse(courseId: string): Promise<Course | null> {
  const snap = await getDoc(doc(db, 'courses', courseId))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Course) : null
}

export async function addCourse(data: NewCourseData): Promise<string> {
  const ref = await addDoc(collection(db, 'courses'), data)
  return ref.id
}

// ═══ FAVORITES ══════════════════════════════════════════════════

export async function addFavorite(uid: string, courseId: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { favorites: arrayUnion(courseId) })
}

export async function removeFavorite(uid: string, courseId: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { favorites: arrayRemove(courseId) })
}

// ═══ ROUNDS ═════════════════════════════════════════════════════

export async function saveRound(uid: string, roundData: NewRoundData, holesData: HoleInput[]): Promise<string> {
  const totalScore = holesData.reduce((s, h) => s + h.strokes, 0)
  const totalPutts = holesData.reduce((s, h) => s + (h.putts || 0), 0)

  const roundRef = await addDoc(collection(db, 'rounds'), {
    userId:     uid,
    courseId:   roundData.courseId,
    datePlayed: Timestamp.fromDate(new Date(roundData.datePlayed + 'T12:00:00')),
    totalScore,
    totalPutts,
    penalties:  roundData.penalties || 0,
    createdAt:  serverTimestamp()
  })

  for (const hole of holesData) {
    await addDoc(collection(db, 'rounds', roundRef.id, 'holes'), {
      holeNumber:        hole.holeNumber,
      strokes:           hole.strokes,
      putts:             hole.putts || 0,
      fairwayHit:        hole.fairwayHit || false,
      greenInRegulation: hole.greenInRegulation || false
    })
  }
  return roundRef.id
}

export async function getRoundHistory(uid: string): Promise<Round[]> {
  const q    = query(collection(db, 'rounds'), where('userId', '==', uid), orderBy('datePlayed', 'desc'))
  const snap = await getDocs(q)
  const rounds: Round[] = []
  for (const d of snap.docs) {
    const round = { id: d.id, ...d.data() } as Round
    const course = await getCourse(round.courseId)
    round.courseName = course?.courseName ?? 'Unknown'
    round.par        = course?.par        ?? 72
    rounds.push(round)
  }
  return rounds
}

export async function getRound(roundId: string): Promise<RoundWithHoles | null> {
  const snap = await getDoc(doc(db, 'rounds', roundId))
  if (!snap.exists()) return null
  const round = { id: snap.id, ...snap.data() } as RoundWithHoles
  const holesSnap = await getDocs(
    query(collection(db, 'rounds', roundId, 'holes'), orderBy('holeNumber'))
  )
  round.holes = holesSnap.docs.map(d => d.data() as HoleInput)
  return round
}

export async function deleteRound(roundId: string): Promise<void> {
  await deleteDoc(doc(db, 'rounds', roundId))
}

// ═══ LEADERBOARD ════════════════════════════════════════════════

export async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  const roundsSnap = await getDocs(collection(db, 'rounds'))
  const byUser: Record<string, { scores: number[]; totalPutts: number; penalties: number }> = {}

  for (const d of roundsSnap.docs) {
   const r = d.data() as Round

  // 🚨 Skip bad data
    if (!r.userId) {
      console.warn('Skipping round with missing userId:', d.id)
      continue
   }

    if (typeof r.totalScore !== 'number') {
      console.warn('Skipping round with invalid totalScore:', d.id)
      continue
    }

    if (!byUser[r.userId]) {
      byUser[r.userId] = { scores: [], totalPutts: 0, penalties: 0 }
    }

    byUser[r.userId].scores.push(r.totalScore)
    byUser[r.userId].totalPutts += r.totalPutts || 0
    byUser[r.userId].penalties  += r.penalties  || 0
  }

  const results: LeaderboardEntry[] = []
  for (const uid of Object.keys(byUser)) {
    const userSnap = await getDoc(doc(db, 'users', uid))
    const name     = userSnap.exists() ? (userSnap.data()['name'] as string) : 'Unknown'
    const data     = byUser[uid]
    const totalRounds = data.scores.length
    const avgScore    = +(data.scores.reduce((a, b) => a + b, 0) / totalRounds).toFixed(1)
    const bestRound   = Math.min(...data.scores)
    const handicap    = +((avgScore - 72) * 0.96).toFixed(1)
    results.push({ uid, name, totalRounds, avgScore, bestRound, handicap })
  }
  return results.sort((a, b) => a.avgScore - b.avgScore).slice(0, 20)
}
