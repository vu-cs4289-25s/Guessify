// src/components/Multiplayer/CreateRoom.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../BackButton/BackButton";
import Navbar from "../Navbar/Navbar";
import { useGameContext } from "../GameContext";
// If you plan to show only the list of genres from your existing GenreSelect:
const genres = [
  "TODAY'S TOP HITS",
  "POP",
  "FOLK",
  "HIP-HOP / RAP",
  "JAZZ",
  "METAL",
  "ROCK",
  "CLASSICAL",
  "INDIE",
  "COUNTRY",
  "BLUES",
  "K-POP",
];

const CreateRoom = () => {
  const { setGameGenre } = useGameContext();
  const [selectedGenre, setSelectedGenre] = useState("");
  const navigate = useNavigate();

  // Example local function to generate a random code
  const generateRoomCode = () => {
    return Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const handleCreateRoom = () => {
    if (!selectedGenre) return alert("Please select a genre");
    // Save the genre to global context so the game knows which playlist to use
    setGameGenre(selectedGenre);

    // Generate a code and navigate to Lobby
    const newCode = generateRoomCode();
    // Optionally, you could do this with a Socket.IO server call like:
    // socket.emit("createRoom", { genre: selectedGenre }, (roomCode) => { ... });

    navigate(`/game/lobby/${newCode}`, { state: { host: true } });
  };

  return (
    <div className="create-room-container">
      <Navbar />
      <BackButton to="/game/multiplayer" />

      <h2>Create a Room</h2>
      <p>Select a genre (multiplayer does NOT show high scores):</p>
      <select
        value={selectedGenre}
        onChange={(e) => setSelectedGenre(e.target.value)}
      >
        <option value="">-- Select Genre --</option>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>

      <button onClick={handleCreateRoom} style={{ marginTop: "20px" }}>
        CREATE ROOM
      </button>
    </div>
  );
};

export default CreateRoom;
