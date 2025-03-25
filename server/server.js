const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ------------------ Spotify Token Exchange ------------------ //
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

// ------------------ Create Server & Socket.IO ------------------ //
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// ------------------ In-Memory Rooms ------------------ //
// structure: rooms[roomCode] = { players: [], hostId: 'someUserId' }
const rooms = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Called when a user attempts to join a room
  socket.on("joinRoom", (payload, callback) => {
    const { roomCode, userId } = payload;
    console.log(`User ${userId} joining room: ${roomCode}`);

    // 1. Create room if it doesn't exist, set host to current user
    if (!rooms[roomCode]) {
      rooms[roomCode] = {
        players: [],
        hostId: userId,
      };
    }

    console.log("Room data before forcing host:", rooms[roomCode]);

    const room = rooms[roomCode];

    // 2. If for some reason we have no hostId, but the room *does* exist:
    //    - If there are existing players, pick the first as the new host
    //    - Otherwise, this user is the host
    if (!room.hostId) {
      if (room.players.length > 0) {
        room.hostId = room.players[0].userId;
      } else {
        room.hostId = userId;
      }
    }

    // 3. Build the player's data
    const playerData = {
      userId,
      displayName: `Player-${userId.slice(0, 5) || "Anon"}`,
      socketId: socket.id,
    };

    // 4. Add them to the room if they're not already in it
    const alreadyInRoom = room.players.some((p) => p.userId === userId);
    if (!alreadyInRoom) {
      room.players.push(playerData);
    }

    // 5. Join the Socket.IO room
    socket.join(roomCode);

    // 6. Send updated info back to *this* client
    //    The callback signature is (players, hostId)
    callback(room.players, room.hostId);

    // 7. Notify everyone else in the room about the updated player list & host
    io.in(roomCode).emit("roomPlayersUpdate", room.players);
    io.in(roomCode).emit("hostChanged", room.hostId);
  });

  // The host clicks 'Start Game'
  socket.on("startGame", ({ roomCode, genre }) => {
    console.log(`Game started in room ${roomCode}, genre: ${genre}`);
    io.in(roomCode).emit("gameStarted", { roomCode, genre });
  });

  // Handle a user leaving (disconnecting)
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // Check all rooms to find where this socket was
    for (const code in rooms) {
      const room = rooms[code];
      const idx = room.players.findIndex((p) => p.socketId === socket.id);

      // If found them in this room
      if (idx !== -1) {
        const leavingPlayer = room.players.splice(idx, 1)[0];
        console.log(`User ${leavingPlayer.userId} left room: ${code}`);

        // If they were the host, reassign to someone else in the room
        if (leavingPlayer.userId === room.hostId) {
          const newHost = room.players[0]; // pick the first remaining
          room.hostId = newHost?.userId || null;

          // If we found a new host, announce it
          if (newHost) {
            io.in(code).emit("hostChanged", room.hostId);
          }
        }

        // Send updated player list to everyone
        io.in(code).emit("roomPlayersUpdate", room.players);

        // If no one left, delete the room
        if (room.players.length === 0) {
          console.log(`Room ${code} is now empty. Deleting it...`);
          delete rooms[code];
        }
        break;
      }
    }
  });
});

const PORT = 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
