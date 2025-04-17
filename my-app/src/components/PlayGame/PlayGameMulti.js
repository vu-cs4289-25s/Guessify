import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import WebPlayback from "../../components/WebPlayback/WebPlayback";
import Navbar from "../../components/Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import ConfirmationPopup from "../ConfirmationPopup/ConfirmationPopup";
import GameOverPopup from "../GameOverPopup/GameOverPopup";
import HowToPlayOverlay from "../HowToPlayOverlay/HowToPlayOverlay";
import BonusPointsPopup from "../BonusPointsPopup/BonusPointsPopup";
import GuessesOverlay from "../GuessesOverlay/GuessesOverlay";
import { useGameContext } from "../../components/GameContext";
import { useUser } from "../userContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { isSongTitleCorrect } from "./SongMatching";
import { v4 as uuidv4 } from "uuid";
import "./PlayGame.css";

const PlayGameMulti = () => {
  const { roomCode } = useParams();
  const { userId } = useUser();
  const { gameGenre } = useGameContext();
  const navigate = useNavigate();

  // Refs
  const inputRef = useRef(null);

  // Socket
  const [socket, setSocket] = useState(null);
  const location = useLocation();
  const initialHostId = location.state?.hostId || null;

  // Spotify
  const [token, setToken] = useState(null);

  // This is the URI the host picks – shared with everyone
  const [trackUriFromHost, setTrackUriFromHost] = useState(null);

  // Store info about the currently playing track (so we can match guesses, etc.)
  const [trackInfo, setTrackInfo] = useState(null);

  // Basic states
  const [hostId, setHostId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [volume, setVolume] = useState(50);
  const [displayNamesMap, setDisplayNamesMap] = useState({});

  // Score & GameOver
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);

  // Timers
  const [guessedCorrectly, setGuessedCorrectly] = useState(false);
  //   const [timeoutCount, setTimeoutCount] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [songCount, setSongCount] = useState(0);

  // Overlays
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Bonus points
  const [bonusPopups, setBonusPopups] = useState([]);
  const bonusAwardedRef = useRef(false);

  // Guesses
  const [guesses, setGuesses] = useState([]);
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const hasGuessedRef = useRef(false);
  const [players, setPlayers] = useState([]);
  const [missedCount, setMissedCount] = useState(0);
  const [fastestGuessTime, setFastestGuessTime] = useState(null);
  const [fastestGuessedSong, setFastestGuessedSong] = useState(null);

  // If user answered or time ran out
  const showAnswer = guessedCorrectly || timeRemaining === 0;

  const addBonusPopup = (points) => {
    const id = uuidv4();
    setBonusPopups((prev) => [...prev, { id, points }]);

    setTimeout(() => {
      setBonusPopups((prev) => prev.filter((popup) => popup.id !== id));
    }, 3000); // how long the popup stays
  };

  const fetchDisplayNames = async (playersArray) => {
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
  };

  const emitMissedPlayers = () => {
    if (isHost && socket) {
      const missedUserIds = players
        .filter(
          (p) => !guesses.find((g) => g.userId === p.userId && g.isCorrect)
        )
        .map((p) => p.userId);

      socket.emit("roundEnded", { roomCode, missedUserIds });
    }
  };

  // -----------------------------------
  // Socket Setup / Lifecycle
  // -----------------------------------
  useEffect(() => {
    const newSocket = io("http://localhost:5001");
    setSocket(newSocket);

    // Join the room
    newSocket.emit(
      "joinRoom",
      { roomCode, userId },
      (players, initialHostId, gameAlreadyStarted, savedScore) => {
        setIsHost(userId === initialHostId);
        setHostId(initialHostId);

        // 👇 Restore score
        if (savedScore !== undefined) {
          setScore(savedScore);
        }

        // 👇 Fetch display names
        fetchDisplayNames(players);
        setPlayers(players);
      }
    );

    // Listen for host-chosen track
    newSocket.on("playSongUri", (uri) => {
      console.log("Received song URI from host:", uri);
      setTrackUriFromHost(uri);
      setFeedback("");
      setGuessedCorrectly(false);
      setTimeRemaining(15);
      setMusicStarted(true);
      setSongCount((prev) => prev + 1);
      setGuesses([]);
      bonusAwardedRef.current = false;
      hasGuessedRef.current = false;
    });

    newSocket.on("roomPlayersUpdate", (updatedPlayers) => {
      setPlayers(updatedPlayers);
      fetchDisplayNames(updatedPlayers);
    });

    newSocket.on("hostChanged", (newHostId) => {
      setHostId(newHostId);
      setIsHost(newHostId === userId);
    });

    newSocket.on("gameOver", async () => {
      setGameOver(true);
      setMusicStarted(false);
      setShowGameOverPopup(true);

      // try {
      //   const gameRef = doc(db, "gamesMulti", roomCode);
      //   const snapshot = await getDoc(gameRef);

      //   if (!snapshot.exists()) return;

      //   const gameData = snapshot.data();
      //   const originalPlayers = gameData.players || [];

      //   const finalScoresMap = {};
      //   players.forEach((p) => {
      //     const guess = guesses.find((g) => g.userId === p.userId);
      //     finalScoresMap[p.userId] = {
      //       score: p.userId === userId ? score : 0,
      //       fastestGuess: guess?.fastestGuess || null,
      //     };
      //   });

      //   const updatedPlayers = originalPlayers.map((p) => {
      //     const updates = finalScoresMap[p.userId];
      //     return updates ? { ...p, ...updates } : p;
      //   });

      //   await setDoc(
      //     gameRef,
      //     {
      //       players: updatedPlayers,
      //       status: "completed",
      //       endedAt: Date.now(),
      //     },
      //     { merge: true }
      //   );
      // } catch (err) {
      //   console.error("❌ Error saving game results:", err);
      // }

      // localStorage.setItem("roomCode", roomCode);
    });

    // Listen for guesses from other players
    newSocket.on(
      "playerGuessed",
      ({ userId: guesserId, guess, isCorrect, isClose }) => {
        setGuesses((prev) => [
          ...prev.filter((g) => g.userId !== guesserId),
          { userId: guesserId, guess, isCorrect, isClose }, // ✅ include both
        ]);
      }
    );

    return () => newSocket.disconnect();
  }, [roomCode, userId]);

  // -----------------------------------
  // Spotify Token
  // -----------------------------------
  useEffect(() => {
    if (!userId) return;
    const fetchSpotifyToken = async () => {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setToken(userData.accessToken);
      }
    };
    fetchSpotifyToken();
  }, [userId]);

  // -----------------------------------
  // Timer (countdown)
  // -----------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      if (musicStarted && timeRemaining > 0) {
        setTimeRemaining((prev) => prev - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [musicStarted, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0 && isHost) {
      emitMissedPlayers();
    }
  }, [timeRemaining, isHost, guesses, players]);

  // -----------------------------------
  // If time runs out
  // -----------------------------------
  useEffect(() => {
    if (timeRemaining === 0 && !guessedCorrectly) {
      setMissedCount((prev) => prev + 1);
      setGuessedCorrectly(true);
      setFeedback(
        `Time's up! The correct answer was: "${songTitle}" by ${songArtist}.`
      );

      emitMissedPlayers();
    }
  }, [
    timeRemaining,
    guessedCorrectly,
    songTitle,
    songArtist,
    isHost,
    socket,
    players,
    guesses,
  ]);

  // -----------------------------------
  // Host picks a random track
  // -----------------------------------
  const getPlaylistId = (genre) => {
    const playlists = {
      "TODAY'S TOP HITS": "6q4q9SfMy2w3ae4YROBncd",
      POP: "34NbomaTu7YuOYnky8nLXL",
      FOLK: "1WXXO8g0zyY9f2OIRsL96X",
      "HIP-HOP / RAP": "7xjtqlGL5HuIdVF9rj1ADs",
      JAZZ: "5IbvIjc5HVU7gaiCniQHEC",
      METAL: "54roY8wSrfInsgbHljU6du",
      ROCK: "1ti3v0lLrJ4KhSTuxt4loZ",
      CLASSICAL: "27Zm1P410dPfedsdoO9fqm",
      INDIE: "22VR7ZV8z45dnbPWj19HHL",
      COUNTRY: "7APcM0pDgeFCZi1HlrsWCM",
      BLUES: "2uGtHlsrXprWFdIf7jqYsV",
      "K-POP": "6tQDMnj0qImEl6AKA1Uv74",
    };
    return playlists[genre] || playlists["TODAY'S TOP HITS"];
  };

  const pickRandomTrackUri = async () => {
    if (!token) {
      console.error("No token for host random track picking.");
      return null;
    }
    const playlistId = getPlaylistId(gameGenre);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch playlist tracks");
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        console.error("No tracks in playlist");
        return null;
      }

      const validTracks = data.items.filter((item) => {
        const t = item.track;
        return t && t.uri && t.is_playable !== false;
      });
      if (validTracks.length === 0) {
        console.error("No valid tracks found");
        return null;
      }

      const randIndex = Math.floor(Math.random() * validTracks.length);
      const randUri = validTracks[randIndex].track.uri;
      console.log("Host picked random track:", randUri);
      return randUri;
    } catch (err) {
      console.error("Error picking random track:", err);
      return null;
    }
  };

  const handleHostPickTrack = async () => {
    if (!isHost || !socket) return;
    
    const chosenUri = await pickRandomTrackUri();
    if (!chosenUri) {
      console.error("Failed to get track URI");
      return;
    }
    
    console.log("Host picked track:", chosenUri);
    emitMissedPlayers();
    socket.emit("playSongUri", { roomCode, uri: chosenUri });
  };

  // -----------------------------------
  // Handle Guess
  // -----------------------------------
  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || guessedCorrectly || timeRemaining === 0) return;

    const { isCorrect, isClose } = isSongTitleCorrect(
      userInput,
      trackInfo?.name || "",
      gameGenre
    );

    // Send to server so others see it
    if (socket) {
      socket.emit("playerGuessed", {
        roomCode,
        userId,
        guess: isCorrect
          ? "got it correct!"
          : isClose
          ? "was close!"
          : userInput,
        isCorrect,
        isClose,
      });
    }

    if (isCorrect) {
      let pointsToAdd = 0;
      let bonusPoints = 0;

      if (timeRemaining > 12) {
        pointsToAdd = 1000;
        bonusPoints = 600;
      } else if (timeRemaining > 9) {
        pointsToAdd = 800;
        bonusPoints = 400;
      } else if (timeRemaining > 6) {
        pointsToAdd = 600;
        bonusPoints = 200;
      } else {
        pointsToAdd = 400;
        bonusPoints = 0;
      }

      const newScore = score + pointsToAdd;
      setScore(newScore);

      // ✅ Persist score on server
      if (socket) {
        socket.emit("updateScore", { roomCode, userId, score: newScore });
      }

      setFeedback(`Correct! The song was: "${songTitle}" by ${songArtist}.`);

      if (pointsToAdd > 0 && !bonusAwardedRef.current) {
        // addBonusPopup(bonusPoints); // if you're showing the popup
        bonusAwardedRef.current = true;
      }

      setGuessedCorrectly(true);
      const guessTime = 15 - timeRemaining;
      if (fastestGuessTime === null || guessTime < fastestGuessTime) {
        setFastestGuessTime(guessTime);
      }
      if (!fastestGuessedSong || guessTime < fastestGuessTime) {
        setFastestGuessedSong(`${songTitle} by ${songArtist}`);
      }
    } else if (isClose) {
      setFeedback("Close, try again!");
    } else {
      setFeedback("Try again!");
    }
    setUserInput("");
  };

  // -----------------------------------
  // Navigation
  // -----------------------------------
  const handleNavigationAttempt = (e, path) => {
    if (e) e.preventDefault();
    setShowConfirm(true);
    setPendingNavigation(path);
  };

  const confirmLeave = () => {
    if (socket) socket.disconnect();
    window.location.href = pendingNavigation || "/game/multiplayer";
  };

  // -----------------------------------
  // Volume
  // -----------------------------------
  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    const deviceId = localStorage.getItem("device_id");
    if (!deviceId) return;
    axios.put(
      `https://api.spotify.com/v1/me/player/volume?volume_percent=${newVolume}&device_id=${deviceId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleEndGame = () => {
    emitMissedPlayers();

    if (socket && isHost) {
      socket.emit("gameOver", {
        roomCode,
        missedCounts: players.map((p) => ({
          userId: p.userId,
          missedCount: p.userId === userId ? missedCount : 0, // or however you count
        })),
        fastestGuesses: players.map((p) => ({
          userId: p.userId,
          fastestGuess: p.userId === userId ? fastestGuessTime : null, // you need to store this
        })),
        fastestGuessedSong,
      });
    }
    setGameOver(true);
    setMusicStarted(false);
    setShowGameOverPopup(true);
  };

  // -----------------------------------
  // Render
  // -----------------------------------
  return (
    <div className="play-game-container">
      {/* Top Nav */}
      <Navbar onNavClick={handleNavigationAttempt} />
      <BackButton onClick={(e) => handleNavigationAttempt(e, "/")} />

      {/* Countdown Timer */}
      <div className="countdown-circle">{timeRemaining}</div>

      {/* Main Overlay */}
      <div className="guess-overlay">
        <h2 className="guess-title">GUESS THE SONG!</h2>
        <h2 className="subtitle">{gameGenre}</h2>

        {/* Host pick button */}
        {isHost && (
          <button
            className="skip-song-button"
            onClick={
              songCount === 0
                ? handleHostPickTrack
                : songCount < 5
                ? handleHostPickTrack
                : handleEndGame
            }
          >
            {songCount === 0
              ? "Start Song"
              : songCount < 5
              ? "Next Song"
              : "End Game"}
          </button>
        )}

        {/* Spotify Playback */}
        <div className="overlay-panel">
          <WebPlayback
            // Pass the URI from the host down to WebPlayback
            trackUriFromHost={trackUriFromHost}
            showAnswer={showAnswer}
            onSongStarted={() => {
              setMusicStarted(true);
              setTimeRemaining(15);
            }}
            onTrackChange={(info) => {
              console.log("Track changed:", info);
              setTrackInfo(info);
              if (info?.name) setSongTitle(info.name);
              if (info?.artist) setSongArtist(info.artist);
            }}
          />
        </div>

        {/* Feedback */}
        {(feedback || showAnswer) && (
          <div className="feedback-message">
            <p>
              {feedback ||
                `The correct answer was: "${songTitle}" by ${songArtist}.`}
            </p>
          </div>
        )}

        {/* Guess Input */}
        <form className="guess-form" onSubmit={handleGuessSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter song title"
          />
        </form>

        <p className="score-missed">Score: {score}</p>
        {/* <p className="score-missed">Missed: {timeoutCount}</p> */}

        {/* HowToPlay Toggle */}
        <div
          className="question-icon"
          onClick={() => setShowHowToPlay((prev) => !prev)}
          style={{ cursor: "pointer" }}
        >
          ?
        </div>
      </div>

      {/* Volume Controls */}
      <div className="audio-controls">
        <button>🔈</button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>

      {/* Bonus Popups */}
      {bonusPopups.map((popup) => (
        <BonusPointsPopup
          key={popup.id}
          points={popup.points}
          onRemove={() =>
            setBonusPopups((prev) => prev.filter((p) => p.id !== popup.id))
          }
        />
      ))}

      {/* Confirmation Popup */}
      {showConfirm && (
        <ConfirmationPopup
          onConfirm={confirmLeave}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* GameOver Popup */}
      {showGameOverPopup && (
        <GameOverPopup
          mode="multi"
          roomCode={roomCode}
          onClose={() => setShowGameOverPopup(false)}
        />
      )}

      {/* Show Player Guesses */}
      <GuessesOverlay
        players={players}
        guesses={guesses}
        currentUserId={userId}
        displayNamesMap={displayNamesMap}
      />

      {/* HowToPlay Overlay */}
      <HowToPlayOverlay
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
    </div>
  );
};

export default PlayGameMulti;
