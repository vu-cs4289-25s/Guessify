import React, { useState, useEffect, useCallback } from "react";
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
  const [currentGenre, setCurrentGenre] = useState("TODAY'S TOP HITS");

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [profilePicsMap, setProfilePicsMap] = useState({});
  const [startClicked, setStartClicked] = useState(false);

  const isHost = userId === hostId;

  const fetchDisplayNames = useCallback(async (playersArray) => {
    try {
      const nameMap = {};
      const picMap = {};
  
      for (const p of playersArray) {
        const userRef = doc(db, "users", p.userId);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const firstName = (data.displayName || "No Name").split(" ")[0];
          nameMap[p.userId] = firstName;
          picMap[p.userId] = data.profileImage || null;
        } else {
          nameMap[p.userId] = "Anon";
          picMap[p.userId] = null;
        }
      }
  
      setDisplayNamesMap(nameMap);
      setProfilePicsMap(picMap);
    } catch (error) {
      console.error("Error fetching display names and images:", error);
    }
  }, []);

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
            // Delay navigation to let React finish mounting
            setTimeout(() => {
              navigate(`/game/play-multiplayer/${roomCode}`, {
                state: { hostId: initialHostId },
              });
            }, 50); 
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

    newSocket.on("gameStarted", ({ roomCode: gameRoomCode, genre, hostId: gameHostId }) => {
      navigate(`/game/play-multiplayer/${gameRoomCode}`, {
        state: { hostId: gameHostId },
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [navigate, roomCode, userId, fetchDisplayNames]);

  useEffect(() => {
    // Get the genre from the game document when component mounts
    const fetchGameGenre = async () => {
      try {
        const gameRef = doc(db, "gamesMulti", roomCode);
        const gameDoc = await getDoc(gameRef);
        if (gameDoc.exists() && gameDoc.data().genre) {
          setCurrentGenre(gameDoc.data().genre);
        }
      } catch (error) {
        console.error("Error fetching game genre:", error);
      }
    };
    fetchGameGenre();
  }, [roomCode]);

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
      console.log("Game start data saved:", finalPlayerList);
    } catch (error) {
      console.error("Error saving game start data:", error);
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

      <div className="lobby-panel-wrapper">
        <div className="room-info-panel">
          <div className="room-code">{roomCode}</div>
          <div className="player-count">{players.length}/6 PLAYERS JOINED</div>
          <div className="music-genre">{currentGenre.toUpperCase()}</div>
        </div>

        <div className="player-slot-container">
          {[...Array(6)].map((_, index) => {
            const player = players[index];
            const name = player ? displayNamesMap[player.userId] || "..." : "???";
            const imgSrc = player ? profilePicsMap[player.userId] : null;

            return (
              <div key={index} className="player-slot">
                <div className={`avatar-square ${player ? "filled" : "empty"}`}>
                  {player ? (
                    <img
                      src={imgSrc}
                      alt={name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = null;
                      }}
                    />
                  ) : (
                    <span className="placeholder-text">???</span>
                  )}
                </div>
                <p className="player-label">{name}</p>
              </div>
            );
          })}
        </div>

        {isHost && players.length >= 2 && (
          <div className="start-button-container">
            <button
              className={`start-button ${startClicked ? "clicked" : ""}`}
              onClick={() => {
                setStartClicked(true);
                setTimeout(() => {
                  handleStartGame();
                  setStartClicked(false);
                }, 120);
              }}
            >
              {!startClicked ? (
                <>
                  <img
                    className="default"
                    src="/buttons/button_rectangle_default.png"
                    alt="Start"
                  />
                  <img
                    className="hover"
                    src="/buttons/button_rectangle_hover.png"
                    alt="Start Hover"
                  />
                </>
              ) : (
                <img
                  className="clicked"
                  src="/buttons/button_rectangle_onClick.png"
                  alt="Start Click"
                />
              )}
              <span className={startClicked ? "clicked-text" : ""}>START</span>
            </button>
          </div>
        )}
      </div>

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
