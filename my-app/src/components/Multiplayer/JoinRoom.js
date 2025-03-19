// src/components/Multiplayer/JoinRoom.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../BackButton/BackButton";
import Navbar from "../Navbar/Navbar";

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (!roomCode) return alert("Please enter a room code");

    // Optionally check with server if code is valid
    // socket.emit("joinRoom", roomCode, (response) => { ... });

    // Go to the same Lobby screen
    navigate(`/game/lobby/${roomCode}`, { state: { host: false } });
  };

  return (
    <div className="join-room-container">
      <Navbar />
      <BackButton to="/game/multiplayer" />

      <h2>Join a Room</h2>
      <input
        type="text"
        placeholder="Enter room code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
      />
      <button onClick={handleJoinRoom}>JOIN</button>
    </div>
  );
};

export default JoinRoom;
