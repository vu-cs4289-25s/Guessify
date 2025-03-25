import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useGameContext } from "../GameContext";
import Navbar from "../Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import ConfirmationPopup from "../ConfirmationPopup/ConfirmationPopup";
import { useUser } from "../userContext";

const Lobby = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { userId } = useUser();
  const { gameGenre } = useGameContext();

  const [players, setPlayers] = useState([]);
  const [displayNamesMap, setDisplayNamesMap] = useState({});
  const [socket, setSocket] = useState(null);
  const [hostId, setHostId] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const isHost = userId === hostId;

  useEffect(() => {
    const newSocket = io("http://localhost:5001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit(
        "joinRoom",
        { roomCode, userId },
        (updatedPlayers, initialHostId) => {
          setPlayers(updatedPlayers);
          fetchDisplayNames(updatedPlayers);
          setHostId(initialHostId);
        }
      );
    });

    newSocket.on("roomPlayersUpdate", (updatedPlayers) => {
      setPlayers(updatedPlayers);
      fetchDisplayNames(updatedPlayers);
    });

    newSocket.on("hostChanged", (newHostId) => {
      setHostId(newHostId);
    });

    newSocket.on("gameStarted", () => {
      //   navigate(`/game/play-multiplayer?roomCode=${roomCode}`);
      navigate(`/game/play-multiplayer/${roomCode}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [navigate, roomCode, userId]);

  const fetchDisplayNames = async (playersArray) => {
    try {
      const newMap = {};
      for (const p of playersArray) {
        const userRef = doc(db, "users", p.userId);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const firstName = (snapshot.data().displayName || "No Name").split(
            " "
          )[0];
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

  const handleLeaveAttempt = (e, path) => {
    e.preventDefault();
    setShowConfirm(true);
    setPendingNavigation(path || "/game/multiplayer");
  };

  const handleConfirmLeave = () => {
    if (socket) {
      socket.disconnect();
    }
    window.location.href = pendingNavigation || "/game/multiplayer";
  };

  const handleCancelLeave = () => {
    setShowConfirm(false);
    setPendingNavigation(null);
  };

  console.log("DEBUG LOBBY:", {
    userId,
    isHost,
    hostId,
    players,
    playersLength: players.length,
  });

  return (
    <div className="lobby-container">
      <Navbar onNavClick={handleLeaveAttempt} />
      <BackButton onClick={handleLeaveAttempt} />

      <h2>Lobby for Room: {roomCode}</h2>
      <p>Players in this Room:</p>
      <ul>
        {players.map((p) => {
          const isCurrentUser = p.userId === userId;
          const isThisHost = p.userId === hostId;
          return (
            <li
              key={p.userId}
              style={{ color: isCurrentUser ? "yellow" : "white" }}
            >
              {displayNamesMap[p.userId] || "Loading..."}{" "}
              {isThisHost && "(Host)"}
            </li>
          );
        })}
      </ul>

      {isHost && players.length >= 2 && (
        <button onClick={handleStartGame}>START GAME</button>
      )}

      {isHost && players.length < 2 && (
        <p>You need at least 2 players to start!</p>
      )}

      {!isHost && <p>Waiting for the host to start the game...</p>}

      {showConfirm && (
        <ConfirmationPopup
          onConfirm={handleConfirmLeave}
          onCancel={handleCancelLeave}
        />
      )}
    </div>
  );
};

export default Lobby;
