const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const { setDoc, doc } = require("firebase/firestore");
const { db } = require("./admin");

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

// Create Server & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// In-Memory Rooms: rooms[roomCode] = { players: [...], hostId }
const rooms = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // 1) joinRoom
  socket.on("joinRoom", (payload, callback) => {
    const { roomCode, userId } = payload;
    console.log(`User ${userId} joining room: ${roomCode}`);

    if (!rooms[roomCode]) {
      rooms[roomCode] = {
        players: [],
        hostId: userId,
        gameStarted: false,
        score: {},
      };
    }

    const room = rooms[roomCode];

    // If no host, assign
    if (!room.hostId) {
      if (room.players.length > 0) {
        room.hostId = room.players[0].userId;
      } else {
        room.hostId = userId;
      }
    }

    // Add user to room
    const playerData = {
      userId,
      displayName: `Player-${userId.slice(0, 5) || "Anon"}`,
      socketId: socket.id,
    };

    const alreadyInRoom = room.players.some((p) => p.userId === userId);
    if (!alreadyInRoom) {
      room.players.push(playerData);
    }

    socket.join(roomCode);

    console.log("Returning to client:", {
      players: room.players,
      hostId: room.hostId,
      gameStarted: room.gameStarted,
    });

    callback(
      room.players,
      room.hostId,
      room.gameStarted,
      room.score?.[userId] || 0
    );

    // Notify entire room
    io.in(roomCode).emit("roomPlayersUpdate", room.players);
    io.in(roomCode).emit("hostChanged", room.hostId);
  });

  // 2) startGame
  socket.on("startGame", async ({ roomCode, genre, hostId }) => {
    console.log(`Game started in room ${roomCode}, genre: ${genre}`);

    if (rooms[roomCode]) {
      rooms[roomCode].gameStarted = true;
    }

    try {
      const roomRef = db.collection("rooms").doc(roomCode);
      await roomRef.set({ gameStarted: true }, { merge: true });
      console.log("Firestore gameStarted flag updated successfully");
    } catch (error) {
      console.error("Failed to update gameStarted in Firestore:", error);
    }

    io.in(roomCode).emit("gameStarted", { roomCode, genre, hostId });
  });

  // 3) newSong from host
  socket.on("newSong", ({ roomCode, trackInfo }) => {
    console.log(`Host in room ${roomCode} playing song:`, trackInfo.name);
    io.in(roomCode).emit("playSong", trackInfo);
  });

  // 4) If you want the host to broadcast just a URI (instead of full track info)
  //    This is an alternative approach if you have `playSongUri` event
  socket.on("playSongUri", ({ roomCode, uri }) => {
    console.log(`Host in room ${roomCode} broadcasting trackUri:`, uri);
    io.in(roomCode).emit("playSongUri", uri);
  });

  // 5) playerGuessed
  socket.on("playerGuessed", ({ roomCode, userId, guess }) => {
    console.log(`User ${userId} guessed: ${guess}`);
    io.in(roomCode).emit("playerGuessed", { userId, guess });
  });

  // playerGuessedCorrect
  socket.on("playerGuessedCorrect", ({ roomCode, userId }) => {
    io.in(roomCode).emit("playerGuessedCorrect", { userId });
  });

  socket.on("updateScore", ({ roomCode, userId, score }) => {
    const room = rooms[roomCode];
    if (room) {
      if (!room.score) room.score = {};
      room.score[userId] = score;
      console.log(`Updated score for ${userId}: ${score}`);
    }
  });

  // 6) End game (broadcast to everyone in the room)
  socket.on("gameOver", ({ roomCode }) => {
    console.log(`Host ended the game in room ${roomCode}`);
    io.in(roomCode).emit("gameOver");
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    for (const code in rooms) {
      const room = rooms[code];
      const idx = room.players.findIndex((p) => p.socketId === socket.id);
      if (idx !== -1) {
        const leavingPlayer = room.players.splice(idx, 1)[0];
        console.log(`User ${leavingPlayer.userId} left room: ${code}`);

        // If host left, reassign
        if (leavingPlayer.userId === room.hostId) {
          const newHost = room.players[0];
          room.hostId = newHost?.userId || null;
          if (newHost) {
            io.in(code).emit("hostChanged", room.hostId);
          }
        }

        io.in(code).emit("roomPlayersUpdate", room.players);

        // If room is empty, delete
        if (room.players.length === 0) {
          console.log(`Room ${code} empty => deleting it`);
          delete rooms[code];
        }

        break;
      }
    }
  });
});

const PORT = 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
