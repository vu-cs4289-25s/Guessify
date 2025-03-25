import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import "./MultiplayerRoom.css";

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    if (!roomCode) {
      setError(true);
      return;
    }

    // ✅ Check Firestore for room existence
    try {
      const roomRef = doc(db, "rooms", roomCode);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        setError(true);
        return;
      }

      setError(false);
      navigate(`/game/lobby/${roomCode}`, { state: { host: false } });
    } catch (err) {
      console.error("Error checking room in Firestore:", err);
      setError(true);
    }
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
            setError(false);
          }}
        />

        {error && (
          <p className="error-message">Please enter a valid room code</p>
        )}

        <button className="room-game-mode-button" onClick={handleJoinRoom}>
          JOIN ROOM
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;
