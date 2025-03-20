import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import "./MultiplayerRoom.css"; // New shared CSS

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState(false); // Error state
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (!roomCode) {
      setError(true); // Show error message
      return;
    }
    setError(false); // Clear error if valid
    navigate(`/game/lobby/${roomCode}`, { state: { host: false } });
  };

  return (
    <div className="game-mode-container">
      <Navbar />
      <BackButton to="/game/multiplayer" />

      <div className="room-mode-overlay">
        <h2>JOIN A ROOM</h2>

        <input
          type="text"
          className="room-input"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => {
            setRoomCode(e.target.value.toUpperCase());
            setError(false); // Remove error when user starts typing
          }}
        />

        {/* Error message */}
        {error && <p className="error-message">Please enter a room code</p>}

        <button className="room-game-mode-button" onClick={handleJoinRoom}>
          JOIN ROOM
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;
