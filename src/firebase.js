import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

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
let app;
let analytics = null;
let db;
let functions;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize analytics only if supported
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  }).catch(e => {
    console.warn('Analytics not supported:', e);
  });

  // Initialize Firestore and Functions
  db = getFirestore(app);
  functions = getFunctions(app);

  // Use emulators in development
  if (window.location.hostname === 'localhost') {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Provide fallback values if initialization fails
  app = null;
  db = null;
  functions = null;
}

export { app, analytics, db, functions };
