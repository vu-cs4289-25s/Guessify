import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import Navbar from "../Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import { useGameContext } from "../GameContext";
import "./MultiplayerRoom.css";

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
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const generateRoomCode = () =>
    Math.random().toString(36).substr(2, 5).toUpperCase();

  const handleCreateRoom = async () => {
    if (!selectedGenre) {
      setError(true);
      return;
    }

    setError(false);
    setGameGenre(selectedGenre);
    const newCode = generateRoomCode();

    // ✅ Save the room to Firestore
    try {
      await setDoc(doc(db, "rooms", newCode), {
        genre: selectedGenre,
        createdAt: Date.now(),
      });
    } catch (err) {
      console.error("Error creating room in Firestore:", err);
    }

    navigate(`/game/lobby/${newCode}`, { state: { host: true } });
  };

  return (
    <div className="game-mode-container">
      <Navbar />
      <BackButton to="/game/multiplayer" />

      <div className="room-mode-overlay">
        <h2>CREATE A ROOM</h2>

        <select
          className="game-genre-select"
          value={selectedGenre}
          onChange={(e) => {
            setSelectedGenre(e.target.value);
            setError(false);
          }}
        >
          <option value="">-- Select Genre --</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        {error && <p className="error-message">Please select a genre</p>}

        <button className="room-game-mode-button" onClick={handleCreateRoom}>
          CREATE ROOM
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;
