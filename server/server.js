const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Spotify Token Exchange
app.post("/api/spotify/token", async (req, res) => {
  try {
    const { code, redirect_uri, client_id } = req.body;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${client_id}:${clientSecret}`).toString("base64"),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri,
        }),
      }
    );

    const data = await tokenResponse.json();
    res.json(data);
  } catch (error) {
    console.error("Error exchanging token:", error);
    res.status(500).json({ error: "Failed to exchange token" });
  }
});

app.post("/api/spotify/refresh-token", async (req, res) => {
  const { refresh_token } = req.body;

  const clientId = "3c75e5c902f94501ae14000ce64c5053";
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token,
  });

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authHeader}`, // ✅ This is REQUIRED
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(
      "Failed to refresh token:",
      err.response?.data || err.message
    );
    res.status(400).json({ error: "Token refresh failed" });
  }
});

const PORT = 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
