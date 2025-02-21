const admin = require("firebase-admin");

// Initialize Firebase Admin SDK with the service account key
const serviceAccount = require("../firebase"); // Add the path to your service account JSON file

// Initialize the Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://guessify-game.firebaseio.com", // Your database URL from Firebase Console
});

const database = admin.database(); // Access the Realtime Database with admin SDK

module.exports = { admin, database };
