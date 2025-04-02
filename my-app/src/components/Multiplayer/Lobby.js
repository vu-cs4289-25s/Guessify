import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
        (updatedPlayers, initialHostId, gameAlreadyStarted) => {
          setPlayers(updatedPlayers);
          fetchDisplayNames(updatedPlayers);
          setHostId(initialHostId);

          console.log("JOIN CALLBACK:", {
            updatedPlayers,
            initialHostId,
            gameAlreadyStarted,
          });

          if (gameAlreadyStarted) {
            // 👇 Delay navigation to let React finish mounting
            setTimeout(() => {
              navigate(`/game/play-multiplayer/${roomCode}`, {
                state: { hostId: initialHostId },
              });
            }, 50); // can try 0, 50, or 100 ms depending on your app
          }
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

    newSocket.on("gameStarted", ({ roomCode, genre, hostId }) => {
      navigate(`/game/play-multiplayer/${roomCode}`, {
        state: { hostId }, // 👈 pass hostId along
      });
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

  const handleStartGame = async () => {
    if (socket) {
      socket.emit("startGame", {
        roomCode,
        genre: gameGenre,
        hostId: userId,
      });
    }

    // Ensure the host is in the players array
    const playerIds = players.map((p) => p.userId);
    const enrichedPlayers = [...players];

    if (!playerIds.includes(userId)) {
      enrichedPlayers.push({ userId }); // fallback just in case
    }

    // Add display names
    const finalPlayerList = enrichedPlayers.map((p) => ({
      userId: p.userId,
      firstName: displayNamesMap[p.userId] || "Anon",
      score: null, // Init to null
    }));

    try {
      const gameRef = doc(db, "gamesMulti", roomCode);
      await setDoc(
        gameRef,
        {
          roomCode,
          genre: gameGenre,
          players: finalPlayerList,
          timestamp: Date.now(),
          status: "in-progress",
          missedTheMost: null, // will be updated at game over
          quickestGuesser: null, // will be updated at game over
        },
        { merge: true }
      );
      console.log("✅ Game start data saved:", finalPlayerList);
    } catch (error) {
      console.error("❌ Error saving game start data:", error);
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
              style={{ color: isCurrentUser ? "#ffe283" : "#f3f3f3" }}
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
