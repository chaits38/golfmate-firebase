// seed.mjs — run once to populate Firestore with sample courses
// Usage: node seed.mjs
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            'AIzaSyBWxtBR8T3RNfm-ICRrnTZ4Gk7F_76c0KQ',
  authDomain:        'golfmate-53cd9.firebaseapp.com',
  projectId:         'golfmate-53cd9',
  storageBucket:     'golfmate-53cd9.firebasestorage.app',
  messagingSenderId: '786778862846',
  appId:             '1:786778862846:web:70f3d545344c915cb421af'
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

const courses = [
  { courseName: 'Pebble Beach Golf Links', location: 'Pebble Beach, CA',  holes: 18, par: 72, yardage: 6828 },
  { courseName: 'Augusta National',        location: 'Augusta, GA',        holes: 18, par: 72, yardage: 7475 },
  { courseName: 'Torrey Pines South',      location: 'La Jolla, CA',       holes: 18, par: 72, yardage: 7607 },
  { courseName: 'Bethpage Black',          location: 'Farmingdale, NY',    holes: 18, par: 71, yardage: 7468 },
  { courseName: 'TPC Sawgrass',            location: 'Ponte Vedra, FL',    holes: 18, par: 72, yardage: 7245 },
  { courseName: 'My Local Course',         location: 'Grand Rapids, MI',   holes: 18, par: 72, yardage: 6200 },
]

console.log('Seeding Firestore courses collection…')
for (const c of courses) {
  await addDoc(collection(db, 'courses'), c)
  console.log('  ✓ Added:', c.courseName)
}
console.log('Done! Open Firebase Console to verify.')
process.exit(0)
