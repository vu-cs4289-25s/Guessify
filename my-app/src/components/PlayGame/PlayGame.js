import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import WebPlayback from "../../components/WebPlayback/WebPlayback";
import BackButton from "../BackButton/BackButton";
import ConfirmationPopup from "../ConfirmationPopup/ConfirmationPopup";
import GameOverPopup from "../GameOverPopup/GameOverPopup";
import { useGameContext } from "../../components/GameContext";
import { useUser } from "../userContext";
import { isSongTitleCorrect } from "./SongMatching";
import "./PlayGame.css";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { v4 as uuidv4 } from "uuid";

const PlayGame = () => {
  const { userId } = useUser();
  const { gameMode, gameGenre } = useGameContext();
  const [token, setToken] = useState(null);
  const [volume, setVolume] = useState(50);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);

  // Hold the current correct song title.
  const [songTitle, setSongTitle] = useState("");
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [guessedCorrectly, setGuessedCorrectly] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);

  // Only start timer once music has started.
  const [musicStarted, setMusicStarted] = useState(false);

  // Track number of timeouts.
  const [timeoutCount, setTimeoutCount] = useState(0);

  // Game over state.
  const [gameOver, setGameOver] = useState(false);

  // Trigger for new song.
  const [nextSongTrigger, setNextSongTrigger] = useState(0);

  // Track when to show the skip button
  const [showSkipButton, setShowSkipButton] = useState(false);

  // Compute showAnswer flag: true if the player answered correctly OR time ran out.
  const showAnswer = guessedCorrectly || timeRemaining === 0;

  // Timer effect: countdown runs only when musicStarted is true and gameOver is false
  useEffect(() => {
    if (!musicStarted || timeRemaining <= 0 || guessedCorrectly || gameOver) {
      return; // If gameOver is true, stop the countdown.
    }

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer); // Cleanup timer when component is unmounted or dependencies change
  }, [musicStarted, timeRemaining, guessedCorrectly, gameOver]); // Add gameOver to the dependency array

  // Effect: if time runs out without a correct answer.
  useEffect(() => {
    if (timeRemaining === 0 && !guessedCorrectly && musicStarted) {
      setTimeoutCount((prevCount) => {
        const updatedCount = prevCount + 1; // Define inside the functional update
        if (updatedCount >= 3) {
          setFeedback(
            `Game Over! You timed out 3 times. The correct answer was: ${songTitle}`
          );
          setGameOver(true);
        } else {
          setFeedback(`Time's up! The correct answer was: ${songTitle}`);
          setGuessedCorrectly(true);
          setTimeout(() => {
            setNextSongTrigger((prev) => prev + 1);
          }, 3000);
        }
        return updatedCount; // Return the updated count
      });
    }
  }, [timeRemaining, guessedCorrectly, musicStarted, songTitle]); // Keep dependencies clean

  // Handler for user guess submission.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (timeRemaining <= 0 || guessedCorrectly) return;

    if (isSongTitleCorrect(userInput, songTitle)) {
      let pointsToAdd = 0;
      if (timeRemaining > 10) {
        pointsToAdd = 1000;
      } else if (timeRemaining > 5) {
        pointsToAdd = 700;
      } else {
        pointsToAdd = 400;
      }
      setScore((prevScore) => prevScore + pointsToAdd);
      setFeedback("Correct!");
      setGuessedCorrectly(true);
      setCorrectCount(correctCount + 1);
      // Trigger next song automatically.
      setNextSongTrigger((prev) => prev + 1);
    } else {
      setFeedback("");
    }
    setUserInput("");
  };

  // Function to handle ANY attempt to leave the game
  const handleNavigationAttempt = (event, path) => {
    if (event) event.preventDefault(); // Prevent immediate navigation
    setPendingNavigation(path);
    setShowConfirm(true);
  };

  const confirmLeave = () => {
    if (pendingNavigation) {
      window.location.href = pendingNavigation; // Full page reload to stop music
    } else {
      window.location.href = "/"; // Reload to home
    }
  };

  const cancelLeave = () => {
    setShowConfirm(false);
    setPendingNavigation(null);
  };

  const handleVolumeChange = (event) => {
    const newVolume = event.target.value;
    setVolume(newVolume);
    const deviceId = localStorage.getItem("device_id");
    console.log(deviceId);
    if (!deviceId) {
      console.error("No device ID found!");
      return;
    }
    axios
      .put(
        `https://api.spotify.com/v1/me/player/volume?volume_percent=${newVolume}&device_id=${deviceId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .catch((error) => {
        console.error("Error adjusting volume:", error);
      });
  };

  // Fetch token from Firestore
  useEffect(() => {
    if (!userId) return;
    const fetchSpotifyToken = async () => {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setToken(userData.accessToken); // store in state
      }
    };
    fetchSpotifyToken();
  }, [userId]);

  const saveGameData = async (score, correctCount) => {
    try {
      const gameId = uuidv4(); // Generate a unique game ID
      const gameDataRef = doc(db, "games", gameId); // Reference to "games" collection

      const gameData = {
        userId: userId,
        score: score,
        correctCount: correctCount,
        timestamp: new Date().toISOString(),
        gameId: gameId,
      };

      await setDoc(gameDataRef, gameData); // Save game data to Firestore
      console.log("Game data saved successfully with ID:", gameId);
      return gameId; // Return the generated game ID
    } catch (error) {
      console.error("Error saving game data:", error);
      return null; // Return null if saving fails
    }
  };

  const handleSkipSong = () => {
    setShowSkipButton(false); // Hide skip button after skipping

    if (gameOver || !musicStarted || guessedCorrectly) return; // Prevent skipping if game is over or song is guessed

    setTimeoutCount((prevCount) => {
      const updatedCount = prevCount + 1; // Increase missed count

      if (updatedCount >= 3) {
        setFeedback(
          `Game Over! You missed 3 songs. The correct answer was: ${songTitle}`
        );
        setGuessedCorrectly(true); // Show the answer even if game ends
        setGameOver(true); // End the game
      } else {
        setFeedback(`Skipped! The correct answer was: ${songTitle}`);
        setGuessedCorrectly(true); // Show the answer
        setTimeout(() => {
          setNextSongTrigger((prev) => prev + 1); // Trigger next song
          setGuessedCorrectly(false); // Reset for next song
          setFeedback(""); // Clear feedback
          setTimeRemaining(15); // Reset timer for next song
        }, 3000);
      }

      return updatedCount; // Return the updated count
    });
  };

  useEffect(() => {
    if (gameOver) {
      const saveAndShowPopup = async () => {
        const gameId = await saveGameData(score, correctCount);
        if (gameId) {
          localStorage.setItem("gameId", gameId); // Save gameId to localStorage
        }
        setTimeout(() => {
          setShowGameOverPopup(true); // Show Game Over popup after 3 seconds
        }, 3000);
      };
      saveAndShowPopup();
    }
  }, [gameOver, score, correctCount]);

  useEffect(() => {
    if (showAnswer) {
      setShowSkipButton(false); // Hide the skip button when the answer is displayed
    }
  }, [showAnswer]);

  return (
    <div className="play-game-container">
      {/* Wrap Navbar to detect navigation attempts */}
      <Navbar onNavClick={handleNavigationAttempt} />

      {/* Back Button -> Triggers confirmation popup */}
      <BackButton onClick={(event) => handleNavigationAttempt(event, "/")} />

      <div className="countdown-circle">{timeRemaining}</div>

      <div className="guess-overlay">
        <h2 className="guess-title">GUESS THE SONG!</h2>
        <h2 className="subtitle">{gameGenre}</h2>
        <div className="overlay-panel">
          <WebPlayback
            nextSongTrigger={nextSongTrigger}
            onSongStarted={() => {
              setTimeRemaining(15);
              setGuessedCorrectly(false);
              setMusicStarted(true);
              setFeedback("");
              setShowSkipButton(true);
            }}
            onTrackChange={(trackInfo) => {
              // If trackInfo is an object, update both songTitle and albumCover.
              if (typeof trackInfo === "object") {
                setSongTitle(trackInfo.name);
              } else {
                setSongTitle(trackInfo);
              }
            }}
            showAnswer={showAnswer}
          />
        </div>
        {(feedback || showAnswer) && (
          <div className="feedback-message">
            <p>{feedback || `The correct answer was: ${songTitle}`}</p>
          </div>
        )}

        {showSkipButton && !showAnswer && (
          <button className="skip-song-button" onClick={handleSkipSong}>
            Skip Song
          </button>
        )}

        <p className="score-missed">Score: {score}</p>
        <p className="score-missed">Missed: {timeoutCount}</p>
        <div className="question-icon">?</div>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter song title"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e);
            }
          }}
        />
      </div>
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

      {/* Show Confirmation Popup if user tries to leave */}

      {showConfirm && (
        <ConfirmationPopup onConfirm={confirmLeave} onCancel={cancelLeave} />
      )}

      {showGameOverPopup && (
        <GameOverPopup onClose={() => setShowGameOverPopup(false)} />
      )}
    </div>
  );
};

export default PlayGame;
