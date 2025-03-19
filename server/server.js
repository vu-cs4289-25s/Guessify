// server.js - Combined Express + Socket.IO for Spotify tokens & multiplayer

const express = require("express");
const http = require("http"); // <-- Needed to create HTTP server
const { Server } = require("socket.io"); // <-- Socket.IO server
const cors = require("cors");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ------------------ Spotify Token Exchange Endpoint ------------------ //
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

// ------------------ Create HTTP Server & Attach Socket.IO ------------- //
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // or your front-end URL
  },
});

// ------------------ In-Memory Room Storage (Example) ------------------ //
/*
 rooms = {
   "ABC123": [
       { userId: "some-uid", displayName: "Alice", socketId: "xxx" },
       { userId: "other-uid", displayName: "Bob",   socketId: "yyy" },
   ],
   ...
 }
*/
const rooms = {};

// ------------------ Socket.IO Logic ---------------------------------- //
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Called when a client joins a room
  socket.on("joinRoom", (payload, callback) => {
    const { roomCode, userId } = payload;
    console.log(`User ${userId} joining room: ${roomCode}`);

    if (!rooms[roomCode]) {
      rooms[roomCode] = [];
    }

    // Example displayName (or fetch real name from DB)
    const playerData = {
      userId,
      displayName: `Player-${userId?.slice(0, 5) || "Anon"}`,
      socketId: socket.id,
    };

    // Avoid duplicates if user rejoins
    const alreadyInRoom = rooms[roomCode].some((p) => p.userId === userId);
    if (!alreadyInRoom) {
      rooms[roomCode].push(playerData);
    }

    // Join the Socket.IO room
    socket.join(roomCode);

    // Send updated room data to the callback (just for the new user)
    callback(rooms[roomCode]);
    // Broadcast to everyone in the room that the players have updated
    io.in(roomCode).emit("roomPlayersUpdate", rooms[roomCode]);
  });

  // Called when host clicks "START GAME" button
  socket.on("startGame", (payload) => {
    const { roomCode, genre } = payload;
    console.log(`Game started in room ${roomCode}, genre: ${genre}`);

    // Emitting to everyone in the room that the game has started
    io.in(roomCode).emit("gameStarted", { roomCode, genre });
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // Remove the socket from any rooms it was in
    for (const code in rooms) {
      const players = rooms[code];
      const updatedPlayers = players.filter((p) => p.socketId !== socket.id);

      // If the array changed, broadcast updates
      if (updatedPlayers.length !== players.length) {
        rooms[code] = updatedPlayers;
        io.in(code).emit("roomPlayersUpdate", updatedPlayers);
      }

      // If no players left in room, optionally delete the room
      if (rooms[code].length === 0) {
        delete rooms[code];
      }
    }
  });
});

// ------------------ Start the Server --------------------------------- //
const PORT = 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
