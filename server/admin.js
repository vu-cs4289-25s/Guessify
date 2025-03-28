// server/admin.js
const admin = require("firebase-admin");
let serviceAccount;
try {
  serviceAccount = require("./serviceAccountKey.json");
} catch (error) {
  console.warn(
    "⚠️ No serviceAccountKey.json found. Using env variable instead."
  );
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
