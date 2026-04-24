# ⛳ GolfMate — Vue 3 + TypeScript + Firebase

A full-stack golf score tracking app rebuilt with **Vue 3**, **TypeScript**, **Pinia**, **Vue Router**, **Cloud Firestore**, and **Firebase Auth**. Deployed automatically via **GitHub Actions → Firebase Hosting**.

## Team
- Landon Quist · Samuel Chait · Cody O'Neil

## Live App
https://golfmate-53cd9.web.app

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Vue 3 (Composition API + `<script setup>`) |
| Language    | TypeScript (strict mode)            |
| State       | Pinia                               |
| Routing     | Vue Router 4                        |
| Database    | Cloud Firestore                     |
| Auth        | Firebase Authentication             |
| Bundler     | Vite 5                              |
| Hosting     | Firebase Hosting                    |
| CI/CD       | GitHub Actions                      |

---

## Project Structure

```
src/
├── components/
│   ├── AppLayout.vue      # Sticky nav + page wrapper
│   └── StatCard.vue       # Reusable stat display card
├── views/
│   ├── LoginView.vue
│   ├── SignupView.vue
│   ├── DashboardView.vue
│   ├── NewRoundView.vue   # 18-hole reactive scorecard
│   ├── HistoryView.vue    # Expandable hole-by-hole detail
│   ├── StatsView.vue      # Scoring + accuracy stats
│   ├── CoursesView.vue    # Search, favorite, add courses
│   └── LeaderboardView.vue
├── services/
│   ├── auth.ts            # Firebase Auth helpers
│   ├── db.ts              # Firestore CRUD
│   └── stats.ts           # Stats & handicap computation
├── stores/
│   └── auth.ts            # Pinia auth store
├── router/
│   └── index.ts           # Routes + auth guards
├── types/
│   └── index.ts           # All TypeScript interfaces
├── firebase.ts            # Firebase init & exports
├── main.ts                # App bootstrap
└── style.css              # Global styles
```

---

## Local Setup

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/golfmate-vue.git
cd golfmate-vue

# 2. Install
npm install

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

> **Firebase config** is already set in `src/firebase.ts` for the shared project.

---

## Seed the Database

Run once to add sample courses to Firestore:

```bash
node seed.mjs
```

---

## Build & Deploy

```bash
# Type-check + production build
npm run build

# Manual deploy
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

### GitHub Actions (automatic)
Every push to `main` triggers a build + deploy.  
Every Pull Request gets a **preview channel URL** automatically.

**Required GitHub Secret:**
- `FIREBASE_SERVICE_ACCOUNT` — download from Firebase Console → Project Settings → Service Accounts → Generate new private key

---

## Firestore Collections

```
users/{uid}
  name, email, favorites[], createdAt

courses/{courseId}
  courseName, location, holes, par, yardage

rounds/{roundId}
  userId, courseId, datePlayed, totalScore, totalPutts, penalties, createdAt
  └── holes/{holeId}
        holeNumber, strokes, putts, fairwayHit, greenInRegulation
```

---

## Features
- ✅ Firebase Auth — signup, login, logout, session persistence
- ✅ Firestore — all data stored in the cloud, real-time capable
- ✅ 18-hole reactive scorecard with live score + vs-par totals
- ✅ Hole-by-hole history with expandable detail rows
- ✅ Stats: avg score, best round, fairway %, GIR %, handicap estimate
- ✅ Course search + add new courses
- ✅ Favorite courses (stored per user in Firestore)
- ✅ Global leaderboard ranked by avg score
- ✅ Auth route guards (redirect to login if not authenticated)
- ✅ GitHub Actions CI/CD with PR preview channels
