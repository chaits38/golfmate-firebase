// run once: node seed.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import firebaseConfig from './src/firebase-config.js';

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const courses = [
  { courseName: 'Pebble Beach Golf Links', location: 'Pebble Beach, CA', holes: 18, par: 72, yardage: 6828 },
  { courseName: 'Augusta National',        location: 'Augusta, GA',       holes: 18, par: 72, yardage: 7475 },
  { courseName: 'Torrey Pines South',      location: 'La Jolla, CA',      holes: 18, par: 72, yardage: 7607 },
  { courseName: 'My Local Course',         location: 'Grand Rapids, MI',  holes: 18, par: 72, yardage: 6200 },
];

for (const c of courses) {
  await addDoc(collection(db, 'courses'), c);
  console.log('Added:', c.courseName);
}
