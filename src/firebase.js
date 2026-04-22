// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWxtBR8T3RNfm-ICRrnTZ4Gk7F_76c0KQ",
  authDomain: "golfmate-53cd9.firebaseapp.com",
  projectId: "golfmate-53cd9",
  storageBucket: "golfmate-53cd9.firebasestorage.app",
  messagingSenderId: "786778862846",
  appId: "1:786778862846:web:70f3d545344c915cb421af",
  measurementId: "G-KWQ8QQ9FCH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);