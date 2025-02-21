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
  const [volume, setVolume] = useState(50); // Volume state (0-100)
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

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
    const newVolume = event.target.value; // New volume level (0-100)
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
      setToken(accessToken); // Store token in state
    }
  }, []);

  return (
    <div className="play-game-container">
      <Navbar />

      <BackButton to="#" onClick={handleBack} />

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

      {showConfirm && (
        <ConfirmationPopup onConfirm={confirmLeave} onCancel={cancelLeave} />
      )}
    </div>
  );
};

export default PlayGame;
