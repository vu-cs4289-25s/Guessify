const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const { OpenAI } = require("openai"); 
const { setDoc, doc } = require("firebase/firestore");
const { db } = require("./admin");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

app.post("/api/generate-poster", async (req, res) => {
  const { prompt } = req.body;
  console.log("Received prompt:", prompt);

  try {
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt,
      size: "1024x1024",
    });

    console.log("OpenAI response:", response);
    const imageUrl = response.data[0].url;
    res.json({ imageUrl });
  } catch (err) {
    console.error("OpenAI image generation error:", err?.response?.data || err.message || err);
    res.status(500).json({ error: "Failed to generate poster" });
  }
  
});


// Create Server & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// In-Memory Rooms: rooms[roomCode] = { players: [...], hostId }
const rooms = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Room event handlers (joinRoom, startGame, etc.)
});

const PORT = 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));