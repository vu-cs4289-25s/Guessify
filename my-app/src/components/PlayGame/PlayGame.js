import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import WebPlayback from "../../components/WebPlayback/WebPlayback";
import BackButton from "../BackButton/BackButton";
import ConfirmationPopup from "../ConfirmationPopup/ConfirmationPopup";
import { useGameContext } from "../../components/GameContext";
import { isSongTitleCorrect } from "./SongMatching";
import "./PlayGame.css";

const PlayGame = () => {
  const { gameMode, gameGenre } = useGameContext();
  const [token, setToken] = useState(null);
  const [volume, setVolume] = useState(50);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  // Hold the current correct song title.
  const [songTitle, setSongTitle] = useState("");
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [guessedCorrectly, setGuessedCorrectly] = useState(false);
  const [score, setScore] = useState(0);

  // Only start timer once music has started.
  const [musicStarted, setMusicStarted] = useState(false);

  // Track number of timeouts.
  const [timeoutCount, setTimeoutCount] = useState(0);

  // Game over state.
  const [gameOver, setGameOver] = useState(false);

  // Trigger for new song.
  const [nextSongTrigger, setNextSongTrigger] = useState(0);

  // Compute showAnswer flag: true if the player answered correctly OR time ran out.
  const showAnswer = guessedCorrectly || timeRemaining === 0;

  // Timer effect: countdown runs only when musicStarted is true.
  useEffect(() => {
    if (!musicStarted || timeRemaining <= 0 || guessedCorrectly) {
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [musicStarted, timeRemaining, guessedCorrectly]);

  // Effect: if time runs out without a correct answer.
  useEffect(() => {
    if (timeRemaining === 0 && !guessedCorrectly && musicStarted) {
      const newTimeoutCount = timeoutCount + 1;
      setTimeoutCount(newTimeoutCount);
      if (newTimeoutCount >= 3) {
        setFeedback(`Game Over! You timed out 3 times. The correct answer was: ${songTitle}`);
        setGameOver(true);
      } else {
        setFeedback(`Time's up! The correct answer was: ${songTitle}`);
        setGuessedCorrectly(true);
        // Wait 3 seconds then trigger the next song.
        setTimeout(() => {
          setNextSongTrigger((prev) => prev + 1);
        }, 3000);
      }
    }
  }, [timeRemaining, guessedCorrectly, musicStarted, songTitle, timeoutCount]);

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
      // Trigger next song automatically.
      setNextSongTrigger((prev) => prev + 1);
    } else {
      setFeedback("");
    }
    setUserInput("");
  };

  const handleBack = () => {
    setShowConfirm(true);
  };

  const confirmLeave = () => {
    navigate("/");
  };

  const cancelLeave = () => {
    setShowConfirm(false);
  };

  const handleVolumeChange = (event) => {
    const newVolume = event.target.value;
    setVolume(newVolume);
    const deviceId = localStorage.getItem("device_id");
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

  useEffect(() => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  if (gameOver) {
    return (
      <div className="game-over-container">
        <Navbar />
        <h1>Game Over!</h1>
        <p>Your final score is: {score}</p>
        <Link to="/" className="home-button">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="play-game-container">
      <Navbar />
      <BackButton to="#" onClick={handleBack} />
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
        {feedback && (
          <div className="feedback-message">
            <p>{feedback}</p>
          </div>
        )}
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
      {showConfirm && (
        <ConfirmationPopup onConfirm={confirmLeave} onCancel={cancelLeave} />
      )}
    </div>
  );
};

export default PlayGame;
