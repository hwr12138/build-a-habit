import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDU1WSFtQvsQexvOb1dZvvg2bExyQ5QNkc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "build-a-habit-11b91.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "build-a-habit-11b91",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "build-a-habit-11b91.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "49740107413",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:49740107413:web:0b024b7532c1134477559c",
  measurementId: "G-33BZGJ3HHY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
