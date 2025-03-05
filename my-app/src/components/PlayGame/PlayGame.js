import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import WebPlayback from "../../components/WebPlayback/WebPlayback";
import BackButton from "../BackButton/BackButton";
import ConfirmationPopup from "../ConfirmationPopup/ConfirmationPopup";
import { useGameContext } from "../../components/GameContext";
import "./PlayGame.css";

const PlayGame = () => {
  const { gameMode, gameGenre } = useGameContext();
  const [token, setToken] = useState(null);
  const [volume, setVolume] = useState(50);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Function to handle ANY attempt to leave the game
  const handleNavigationAttempt = (event, path) => {
    if (event) event.preventDefault(); // Prevent immediate navigation
    setPendingNavigation(path);
    setShowConfirm(true);
  };

  const confirmLeave = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation); // Navigate to stored destination
    } else {
      navigate("/"); // Default to home
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

  return (
    <div className="play-game-container">
      {/* Wrap Navbar to detect navigation attempts */}
      <Navbar onNavClick={handleNavigationAttempt} />

      {/* Back Button -> Triggers confirmation popup */}
      <BackButton onClick={(event) => handleNavigationAttempt(event, "/")} />

      <div className="countdown-circle">10</div>

      <div className="guess-overlay">
        <h2 className="guess-title">GUESS THE SONG!</h2>
        <h2 className="subtitle">{gameGenre}</h2>
        <div className="overlay-panel">
          <WebPlayback />
        </div>
        <p className="score-missed">Score: 0</p>
        <p className="score-missed">Missed: 0</p>

        <div className="question-icon">?</div>
        <input type="text" placeholder="Type here..." className="guess-input" />
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
    </div>
  );
};

export default PlayGame;
