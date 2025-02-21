require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// const admin = require("firebase");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Initialize Firebase Admin SDK
// const serviceAccount = require("../firebase.js");
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// Spotify credentials
// const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
// const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const CLIENT_ID = "3c75e5c902f94501ae14000ce64c5053";
const CLIENT_SECRET = "7c4ef5e4001841228a21b4c372d92b02";
const REDIRECT_URI = "http://localhost:3000/auth/callback";

// Store user sessions
let userTokens = {};

// 🔹 Spotify Login Route
app.get("/auth/login", (req, res) => {
  const scope = "user-read-private user-read-email playlist-read-private";
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(
    scope
  )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(authUrl);
});

// 🔹 Spotify OAuth Callback
app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token } = response.data;
    userTokens["user"] = { access_token, refresh_token };

    res.cookie("spotify_access_token", access_token, { httpOnly: true });
    res.redirect("http://localhost:3000/dashboard"); // Redirect to frontend
  } catch (error) {
    res.status(400).json({ error: "Failed to authenticate with Spotify" });
  }
});

// 🔹 Fetch User Data
// app.get("/user/data", async (req, res) => {
//   const token = userTokens["user"]?.access_token;
//   if (!token) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     const response = await axios.get("https://api.spotify.com/v1/me", {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(400).json({ error: "Failed to fetch user data" });
//   }
// });

// 🔹 Save User Data to Firebase
// app.post("/user/save", async (req, res) => {
//   const { userId, data } = req.body;
//   try {
//     await admin
//       .firestore()
//       .collection("users")
//       .doc(userId)
//       .set(data, { merge: true });
//     res.json({ message: "User data saved" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to save data" });
//   }
// });

// 🔹 Logout
app.get("/auth/logout", (req, res) => {
  res.clearCookie("spotify_access_token");
  delete userTokens["user"];
  res.json({ message: "Logged out" });
});

// Start server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
