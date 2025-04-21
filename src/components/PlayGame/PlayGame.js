import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import WebPlayback from "../../components/WebPlayback/WebPlayback";
import BackButton from "../BackButton/BackButton";
import ConfirmationPopup from "../ConfirmationPopup/ConfirmationPopup";
import GameOverPopup from "../GameOverPopup/GameOverPopup";
import HowToPlayOverlay from "../HowToPlayOverlay/HowToPlayOverlay";
import BonusPointsPopup from "../BonusPointsPopup/BonusPointsPopup";
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

  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [guessedCorrectly, setGuessedCorrectly] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [albumCover, setAlbumCover] = useState(null);
  const [albumCoverReady, setAlbumCoverReady] = useState(false); // New state for tracking album cover readiness

  const [totalTimeSurvived, setTotalTimeSurvived] = useState(0);
  const [fastestGuessTime, setFastestGuessTime] = useState(null);
  const [fastestGuessedSong, setFastestGuessedSong] = useState(null);
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [gameEndTime, setGameEndTime] = useState(null);
  const [bonusPopups, setBonusPopups] = useState([]);
  const [bonusAwarded, setBonusAwarded] = useState(false);
  const [currentSongId, setCurrentSongId] = useState(null);
  const bonusAwardedRef = useRef(false);
  const [isSwitchingSong, setIsSwitchingSong] = useState(false);

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
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Compute showAnswer flag: true if the player answered correctly OR time ran out.
  const showAnswer = guessedCorrectly || timeRemaining === 0;

  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    console.log("Game Genre in PlayGame:", gameGenre); // 🔄 Check if gameGenre is set
  }, [gameGenre]);

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

  useEffect(() => {
    if (musicStarted && !roundStartTime) {
      setRoundStartTime(Date.now());
    }
  }, [musicStarted]);

  // Effect: if time runs out without a correct answer.
  // Effect: if time runs out without a correct answer.
  useEffect(() => {
    if (timeRemaining === 0 && !guessedCorrectly && musicStarted) {
      setTimeoutCount((prevCount) => {
        const updatedCount = prevCount + 1;

        if (updatedCount >= 3) {
          setFeedback(
            `Game Over! You timed out 3 times. The correct answer was: "${songTitle}" by ${songArtist}.`
          );
          setGameOver(true);
        } else {
          setFeedback(
            `Time's up! The correct answer was: "${songTitle}" by ${songArtist}.`
          );
          setGuessedCorrectly(true); // Mark as guessed correctly to trigger the next song
          setTimeout(() => {
            setNextSongTrigger((prev) => prev + 1); // Trigger next song
            setGuessedCorrectly(false); // Reset for next song
            setFeedback(""); // Clear feedback
            setTimeRemaining(15); // Reset timer for next song
          }, 3000); // Wait 3 seconds before moving to the next song
        }

        return updatedCount; // Return the updated count
      });
    }
  }, [timeRemaining, guessedCorrectly, musicStarted, songTitle, songArtist]); // Keep dependencies clean

  useEffect(() => {
    const newSongId = uuidv4();
    setCurrentSongId(newSongId);
    bonusAwardedRef.current = false; // Reset bonus ref for new song
  }, [nextSongTrigger]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (timeRemaining <= 0 || guessedCorrectly) return;

    const timeTaken = 15 - timeRemaining;
    const { isCorrect, isClose } = isSongTitleCorrect(
      userInput,
      songTitle,
      gameGenre
    );

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

      setScore((prevScore) => prevScore + pointsToAdd);
      setFeedback(`Correct! The song was: "${songTitle}" by ${songArtist}.`);
      setGuessedCorrectly(true);
      setCorrectCount(correctCount + 1);
      setTotalTimeSurvived((prevTime) => prevTime + timeTaken);

      if (fastestGuessTime === null || timeTaken < fastestGuessTime) {
        setFastestGuessTime(timeTaken);
        setFastestGuessedSong(songTitle);
      }

      // Show bonus points popup only if not already awarded for this song
      if (bonusPoints > 0 && !bonusAwardedRef.current) {
        addBonusPopup(bonusPoints);
        bonusAwardedRef.current = true; // Mark bonus as awarded for this song
      }

      setNextSongTrigger((prev) => prev + 1);
    } else if (isClose) {
      setFeedback("Close, try again!");
    } else {
      setFeedback("Try again!");
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

  const saveGameData = async (score, correctCount, duration, gameGenre) => {
    try {
      const gameId = uuidv4();
      const gameDataRef = doc(db, "games", gameId);

      const gameData = {
        userId: userId,
        score: score,
        correctCount: correctCount,
        totalTimeSurvived: duration || 0, // Ensure duration has a value
        fastestGuessTime: fastestGuessTime || null,
        fastestGuessedSong: fastestGuessedSong || null,
        genre: gameGenre || "UNKNOWN", // 🔄 Ensure gameGenre is saved, even if null
        timestamp: new Date().toISOString(),
        gameId: gameId,
      };

      console.log("Saving game data:", {
        userId,
        score,
        correctCount,
        duration,
        gameGenre, // 🔄 Check if gameGenre is passed
      });

      await setDoc(gameDataRef, gameData);
      console.log("Game data saved successfully with ID:", gameId);
      return gameId;
    } catch (error) {
      console.error("Error saving game data:", error);
      return null;
    }
  };

  const handleSkipSong = () => {
    setShowSkipButton(false); // Hide skip button after skipping

    if (gameOver || !musicStarted || guessedCorrectly) return; // Prevent skipping if game is over or song is guessed

    setTimeoutCount((prevCount) => {
      const updatedCount = prevCount + 1; // Increase missed count

      if (updatedCount >= 3) {
        setFeedback(
          `Game Over! You missed 3 songs. The correct answer was: "${songTitle}" by ${songArtist}.`
        );
        setGuessedCorrectly(true); // Show the answer even if game ends
        setGameOver(true); // End the game
      } else {
        setFeedback(
          `Skipped! The correct answer was: "${songTitle}" by ${songArtist}.`
        );
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
    if (showAnswer) {
      setShowSkipButton(false); // Hide the skip button when the answer is displayed
    }
  }, [showAnswer]);

  useEffect(() => {
    if (gameOver) {
      setGameEndTime(Date.now()); // Record the end time
      const saveAndShowPopup = async () => {
        const duration = Math.floor((Date.now() - gameStartTime) / 1000); // Calculate time survived in seconds
        const gameId = await saveGameData(
          score,
          correctCount,
          duration,
          gameGenre
        );
        if (gameId) {
          localStorage.setItem("gameId", gameId);
        }
        setTimeout(() => {
          setShowGameOverPopup(true);
        }, 3000);
      };
      saveAndShowPopup();
    }
  }, [gameOver, score, correctCount, gameStartTime]);

  const addBonusPopup = (points) => {
    if (isSwitchingSong) return; // Prevent popups during song switch

    const id = Math.random().toString(36).substring(2, 9);
    setBonusPopups((prev) => [...prev, { id, points }]);

    // Use a longer timeout to avoid flashing during transitions
    setTimeout(() => {
      setBonusPopups((prev) => prev.filter((popup) => popup.id !== id));
    }, 5000); // Increase duration for smoother removal
  };

  // Generate a new unique ID for each new song
  useEffect(() => {
    setCurrentSongId(uuidv4());
  }, [nextSongTrigger]);

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
            isMultiplayer={false}
            nextSongTrigger={nextSongTrigger}
            onSongStarted={() => {
              setTimeRemaining(15);
              setGuessedCorrectly(false);
              setMusicStarted(true);
              setFeedback("");
              setShowSkipButton(true);
              if (!gameStartTime) {
                setGameStartTime(Date.now());
              }
            }}
            onTrackChange={(trackInfo) => {
              setIsSwitchingSong(true);
              setBonusPopups([]);
              setTimeout(() => {
                if (trackInfo && typeof trackInfo === "object") {
                  setSongTitle(trackInfo.name);
                  setSongArtist(trackInfo.artist);
                  if (trackInfo.albumCover) {
                    const img = new Image();
                    img.src = trackInfo.albumCover;
                    img.onload = () => setAlbumCoverReady(true);
                    setAlbumCover(trackInfo.albumCover);
                  } else {
                    setAlbumCover(null);
                    setAlbumCoverReady(false);
                  }
                } else {
                  setSongTitle("");
                  setSongArtist("");
                  setAlbumCover(null);
                  setAlbumCoverReady(false);
                }
                setIsSwitchingSong(false);
              }, 500);
            }}
            showAnswer={showAnswer}
            onGameOver={showGameOverPopup}
          />
        </div>
        {(feedback || showAnswer) && (
          <div className="feedback-message">
            <p>
              {feedback ||
                `The correct answer was: "${songTitle}" by ${songArtist}.`}
            </p>
          </div>
        )}

        {showSkipButton && !showAnswer && (
          <button className="skip-song-button" onClick={handleSkipSong}>
            Skip Song
          </button>
        )}

        <p className="score-missed">Score: {score}</p>
        <p className="score-missed">Missed: {timeoutCount}</p>
        <div
          className="question-icon"
          onClick={() => setShowHowToPlay((prev) => !prev)} // Toggle overlay
          style={{ cursor: "pointer" }}
        >
          ?
        </div>

        <input
          ref={inputRef}
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

      {!isSwitchingSong &&
        bonusPopups.map((popup) => (
          <BonusPointsPopup
            key={popup.id}
            points={popup.points}
            onRemove={() =>
              setBonusPopups((prev) => prev.filter((p) => p.id !== popup.id))
            }
          />
        ))}

      {/* Show Confirmation Popup if user tries to leave */}

      {showConfirm && (
        <ConfirmationPopup onConfirm={confirmLeave} onCancel={cancelLeave} />
      )}

      {showGameOverPopup && (
        <GameOverPopup
          mode="single"
          onClose={() => setShowGameOverPopup(false)}
        />
      )}

      <HowToPlayOverlay
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
    </div>
  );
};

export default PlayGame;
