import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { doc, getDoc } from "firebase/firestore";
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

  // Spotify
  const [token, setToken] = useState(null);

  // This is the URI the host picks – shared with everyone
  const [trackUriFromHost, setTrackUriFromHost] = useState(null);

  // Store info about the currently playing track (so we can match guesses, etc.)
  const [trackInfo, setTrackInfo] = useState(null);

  // Basic states
  const [isHost, setIsHost] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [volume, setVolume] = useState(50);

  // Score & GameOver
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);

  // Timers
  const [guessedCorrectly, setGuessedCorrectly] = useState(false);
  const [timeoutCount, setTimeoutCount] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15);

  // Overlays
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Bonus points
  const [bonusPopups, setBonusPopups] = useState([]);

  // Guesses
  const [guesses, setGuesses] = useState([]);

  // If user answered or time ran out
  const showAnswer = guessedCorrectly || timeRemaining === 0;

  // -----------------------------------
  // Socket Setup / Lifecycle
  // -----------------------------------
  useEffect(() => {
    const newSocket = io("http://localhost:5001");
    setSocket(newSocket);

    // Join the room
    newSocket.emit("joinRoom", { roomCode, userId }, (players, hostId) => {
      setIsHost(userId === hostId);
    });

    // Listen for host-chosen track
    newSocket.on("playSongUri", (uri) => {
      setTrackUriFromHost(uri);
      setFeedback("");
      setGuessedCorrectly(false);
      setTimeRemaining(15);
      setMusicStarted(true);
    });

    // Listen for guesses from other players
    newSocket.on("playerGuessed", ({ userId: guesserId, guess }) => {
      setGuesses((prev) => [
        ...prev.filter((g) => g.userId !== guesserId),
        { userId: guesserId, guess },
      ]);
    });

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
      if (musicStarted && !guessedCorrectly && timeRemaining > 0) {
        setTimeRemaining((prev) => prev - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [musicStarted, guessedCorrectly, timeRemaining]);

  // -----------------------------------
  // If time runs out
  // -----------------------------------
  useEffect(() => {
    if (timeRemaining === 0 && !guessedCorrectly) {
      setTimeoutCount((prev) => prev + 1);
      setFeedback("Time's up!");
      setGuessedCorrectly(true);

      // If they've missed 3 times, end game
      if (timeoutCount + 1 >= 3) {
        setFeedback("Game Over! Too many missed guesses.");
        setShowGameOverPopup(true);
        setMusicStarted(false);
      }
    }
  }, [timeRemaining, guessedCorrectly, timeoutCount]);

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
    if (!chosenUri) return;
    // Broadcast this URI to everyone
    socket.emit("playSongUri", { roomCode, uri: chosenUri });
  };

  // -----------------------------------
  // Handle Guess
  // -----------------------------------
  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || guessedCorrectly) return;

    // Send to server so others see it
    if (socket) {
      socket.emit("playerGuessed", {
        roomCode,
        userId,
        guess: userInput,
      });
    }

    // Evaluate guess locally
    const { isCorrect, isClose } = isSongTitleCorrect(
      userInput,
      trackInfo?.name || "",
      gameGenre
    );
    if (isCorrect) {
      setScore((prev) => prev + 1000);
      setFeedback("Correct!");
      setGuessedCorrectly(true);
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
          <button className="skip-song-button" onClick={handleHostPickTrack}>
            Start Song
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
              // Store the actual track name if you want to show it
              // or compare guesses later
              console.log("Track changed:", info);
              setTrackInfo(info);
            }}
          />
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="feedback-message">
            <p>{feedback}</p>
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
        <p className="score-missed">Missed: {timeoutCount}</p>

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
        <GameOverPopup onClose={() => setShowGameOverPopup(false)} />
      )}

      {/* Show Player Guesses */}
      <GuessesOverlay guesses={guesses} currentUserId={userId} />

      {/* HowToPlay Overlay */}
      <HowToPlayOverlay
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
    </div>
  );
};

export default PlayGameMulti;
