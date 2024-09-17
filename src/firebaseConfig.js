import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getDatabase } from 'firebase/database'; // Uncomment if using Realtime Database

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0ugo0VcLbBlKJwrj--JYgh5_7ofpmvJ0",
  authDomain: "todolist-a774e.firebaseapp.com",
  projectId: "todolist-a774e",
  storageBucket: "todolist-a774e.appspot.com",
  messagingSenderId: "376738094924",
  appId: "1:376738094924:web:9ee503ff1a4bddcd8e39e9",
  measurementId: "G-CKDR60BTM1"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 
// const db = getDatabase(app); // Uncomment if using Realtime Database

export { auth, db };
