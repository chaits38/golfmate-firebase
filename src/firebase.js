// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';
import { getFirestore }  from 'firebase/firestore';
import { getAnalytics }  from 'firebase/analytics';

const firebaseConfig = {
  apiKey:            "AIzaSyBWxtBR8T3RNfm-ICRrnTZ4Gk7F_76c0KQ",
  authDomain:        "golfmate-53cd9.firebaseapp.com",
  projectId:         "golfmate-53cd9",
  storageBucket:     "golfmate-53cd9.firebasestorage.app",
  messagingSenderId: "786778862846",
  appId:             "1:786778862846:web:70f3d545344c915cb421af",
  measurementId:     "G-KWQ8QQ9FCH"
};

const app       = initializeApp(firebaseConfig);
export const auth      = getAuth(app);
export const db        = getFirestore(app);
export const analytics = getAnalytics(app);