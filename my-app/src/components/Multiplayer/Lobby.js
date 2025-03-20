// Lobby.js
import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // adjust import path if needed

import { useGameContext } from "../GameContext";
import Navbar from "../Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import { useUser } from "../userContext";

const Lobby = () => {
  const { state } = useLocation();
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const isHost = state?.host || false;
  const { userId } = useUser();
  const { gameGenre } = useGameContext();

  const [players, setPlayers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [displayNamesMap, setDisplayNamesMap] = useState({});

  useEffect(() => {
    // Initialize socket.io once
    const newSocket = io("http://localhost:5001"); // adjust if you use a different port
    setSocket(newSocket);

    // On connect, join the room
    newSocket.on("connect", () => {
      console.log("Socket connected with ID:", newSocket.id);

      // Once connected, join the room
      newSocket.emit("joinRoom", { roomCode, userId }, (updatedPlayers) => {
        setPlayers(updatedPlayers);
        fetchDisplayNames(updatedPlayers);
      });
    });

    // Listen for updated player list
    newSocket.on("roomPlayersUpdate", (updatedPlayers) => {
      setPlayers(updatedPlayers);
      fetchDisplayNames(updatedPlayers);
    });

    // Listen for host starting the game
    newSocket.on("gameStarted", (startData) => {
      navigate(`/game/play?roomCode=${roomCode}`, { state: { multi: true } });
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [navigate, roomCode, userId]);

  // Fetch each player's real displayName from Firestore
  const fetchDisplayNames = async (playersArray) => {
    try {
      const newMap = {};
      for (const p of playersArray) {
        const userRef = doc(db, "users", p.userId);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          // If you only want the first name:
          const fullName = data.displayName || "No Name";
          const firstName = fullName.split(" ")[0];
          newMap[p.userId] = firstName;
        } else {
          newMap[p.userId] = "Anon";
        }
      }
      setDisplayNamesMap(newMap);
    } catch (error) {
      console.error("Error fetching display names:", error);
    }
  };

  const handleStartGame = () => {
    if (socket) {
      socket.emit("startGame", { roomCode, genre: gameGenre });
    }
  };

  return (
    <div className="lobby-container">
      <Navbar />
      <BackButton to="/game/multiplayer" />

      <h2>Lobby for Room: {roomCode}</h2>
      <p>Players in this Room:</p>
      <ul>
        {players.map((p) => {
          const isCurrentUser = p.userId === userId;
          return (
            <li
              key={p.userId}
              style={{ color: isCurrentUser ? "yellow" : "white" }}
            >
              {displayNamesMap[p.userId] || "Loading..."}
            </li>
          );
        })}
      </ul>

      {isHost ? (
        players.length >= 2 ? (
          <button onClick={handleStartGame}>START GAME</button>
        ) : (
          <p>You need at least 2 players to start!</p>
        )
      ) : (
        <p>Waiting for the host to start the game...</p>
      )}
    </div>
  );
};

export default Lobby;
