// src/stats.js
import { db } from './firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getCourse } from './db.js';

export async function getMyStats(uid) {
  const q    = query(collection(db, 'rounds'), where('userId', '==', uid));
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const rounds = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const totalRounds = rounds.length;
  const scores      = rounds.map(r => r.totalScore);
  const avgScore    = +(scores.reduce((a, b) => a + b, 0) / totalRounds).toFixed(1);
  const bestRound   = Math.min(...scores);
  const worstRound  = Math.max(...scores);
  const avgPutts    = +(rounds.reduce((a, r) => a + r.totalPutts, 0) / totalRounds).toFixed(1);
  const totalPenalties = rounds.reduce((a, r) => a + (r.penalties || 0), 0);
  const avgPenalties   = +(totalPenalties / totalRounds).toFixed(1);

  // Hole-level stats
  let fairwayHits = 0, girHits = 0, totalHoles = 0;
  for (const round of rounds) {
    const holesSnap = await getDocs(collection(db, 'rounds', round.id, 'holes'));
    for (const h of holesSnap.docs) {
      const data = h.data();
      fairwayHits += data.fairwayHit        ? 1 : 0;
      girHits     += data.greenInRegulation ? 1 : 0;
      totalHoles++;
    }
  }
  const fairwayPct          = totalHoles ? +((fairwayHits / totalHoles) * 100).toFixed(1) : 0;
  const girPct              = totalHoles ? +((girHits     / totalHoles) * 100).toFixed(1) : 0;
  // Aliases so both naming conventions work
  const fairwaysHitPercent  = fairwayPct;
  const girPercent          = girPct;

  // Handicap (last 20 rounds vs course par)
  const recent = [...rounds]
    .sort((a, b) => b.datePlayed.toMillis() - a.datePlayed.toMillis())
    .slice(0, 20);
  let parSum = 0;
  for (const r of recent) {
    const course = await getCourse(r.courseId);
    parSum += course?.par || 72;
  }
  const avgPar    = parSum / recent.length;
  const handicap  = +((avgScore - avgPar) * 0.96).toFixed(1);
  const avgVsPar  = +(avgScore - avgPar).toFixed(1);

  // Trend last 10
  const trend = recent.slice(0, 10).reverse().map(r => ({
    datePlayed: r.datePlayed.toDate().toISOString().split('T')[0],
    totalScore: r.totalScore,
    courseId:   r.courseId
  }));

  return {
    totalRounds, avgScore, bestRound, worstRound,
    avgPutts, totalPenalties, avgPenalties,
    fairwayPct, girPct,
    fairwaysHitPercent, girPercent,
    handicap, avgVsPar, trend
  };
}

export async function getLeaderboard(courseId) {
  const q    = query(collection(db, 'rounds'), where('courseId', '==', courseId));
  const snap = await getDocs(q);
  const byUser = {};
  for (const d of snap.docs) {
    const r = d.data();
    if (!byUser[r.userId] || r.totalScore < byUser[r.userId].best) {
      byUser[r.userId] = { userId: r.userId, best: r.totalScore, count: 0 };
    }
    byUser[r.userId].count++;
  }
  return Object.values(byUser).sort((a, b) => a.best - b.best).slice(0, 10);
}
