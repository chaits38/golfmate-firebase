import type { Timestamp } from 'firebase/firestore'

// ── Auth ──────────────────────────────────────────────────────
export interface UserProfile {
  uid:       string
  name:      string
  email:     string
  favorites: string[]
  createdAt: Timestamp
}

// ── Courses ───────────────────────────────────────────────────
export interface Course {
  id:         string
  courseName: string
  location:   string
  holes:      number
  par:        number
  yardage:    number
}

export interface NewCourseData {
  courseName: string
  location:   string
  holes:      number
  par:        number
  yardage:    number
}

// ── Rounds ────────────────────────────────────────────────────
export interface Round {
  id:          string
  userId:      string
  courseId:    string
  datePlayed:  Timestamp
  totalScore:  number
  totalPutts:  number
  penalties:   number
  createdAt:   Timestamp
  // Hydrated fields (joined from courses collection)
  courseName?: string
  par?:        number
}

export interface RoundWithHoles extends Round {
  holes: HoleScore[]
}

export interface NewRoundData {
  courseId:    string
  datePlayed:  string   // ISO date string from <input type="date">
  penalties:   number
}

// ── Hole Scores ───────────────────────────────────────────────
export interface HoleScore {
  holeNumber:        number
  strokes:           number
  putts:             number
  fairwayHit:        boolean
  greenInRegulation: boolean
}

export interface HoleInput {
  holeNumber:        number
  strokes:           number
  putts:             number
  fairwayHit:        boolean
  greenInRegulation: boolean
}

// ── Statistics ────────────────────────────────────────────────
export interface PlayerStats {
  totalRounds:       number
  avgScore:          number
  bestRound:         number
  worstRound:        number
  avgPutts:          number
  totalPenalties:    number
  avgPenalties:      number
  fairwayPct:        number
  girPct:            number
  fairwaysHitPercent: number
  girPercent:        number
  handicap:          number
  avgVsPar:          number
  trend:             TrendPoint[]
}

export interface TrendPoint {
  datePlayed: string
  totalScore: number
  courseId:   string
}

// ── Leaderboard ───────────────────────────────────────────────
export interface LeaderboardEntry {
  uid:         string
  name:        string
  totalRounds: number
  avgScore:    number
  bestRound:   number
  handicap:    number
}
