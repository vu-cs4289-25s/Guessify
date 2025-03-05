import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Guessify Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuC32FKc6c2Y0gO9sWzoOBTw606wXChTw",
  authDomain: "guessify-game.firebaseapp.com",
  projectId: "guessify-game",
  storageBucket: "guessify-game.firebasestorage.app",
  messagingSenderId: "41951381176",
  appId: "1:41951381176:web:b5b4f000f4060ccc51d64d",
  measurementId: "G-SN5CWHJ5L5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
