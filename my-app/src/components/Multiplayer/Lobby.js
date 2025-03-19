// src/components/Multiplayer/Lobby.js
import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useGameContext } from "../GameContext";
import Navbar from "../Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import { useUser } from "../userContext";

let socket;

const Lobby = () => {
  const { state } = useLocation();
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const isHost = state?.host || false;
  const { userId } = useUser();
  const { gameGenre } = useGameContext();

  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Connect to your socket server (adjust URL/port as needed)
    socket = io("http://localhost:4000");

    // Join the room with the chosen code
    socket.emit("joinRoom", { roomCode, userId }, (updatedPlayers) => {
      // Callback from server with updated player list
      setPlayers(updatedPlayers);
    });

    // Listen for new player join/leave updates
    socket.on("roomPlayersUpdate", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    // Listen for host starting the game
    socket.on("gameStarted", (startData) => {
      // For example, navigate to a multiplayer version of your game
      // passing the startData or genre if needed.
      navigate(`/game/play?roomCode=${roomCode}`, { state: { multi: true } });
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [navigate, roomCode, userId]);

  const handleStartGame = () => {
    // Only the host can start
    socket.emit("startGame", { roomCode, genre: gameGenre });
  };

  return (
    <div className="lobby-container">
      <Navbar />
      <BackButton to="/game/multiplayer" />

      <h2>Lobby for Room: {roomCode}</h2>
      <p>Players in this Room:</p>
      <ul>
        {players.map((p) => (
          <li key={p.userId}>{p.displayName || p.userId}</li>
        ))}
      </ul>

      {isHost && <button onClick={handleStartGame}>START GAME</button>}
      {!isHost && <p>Waiting for host to start the game...</p>}
    </div>
  );
};

export default Lobby;
