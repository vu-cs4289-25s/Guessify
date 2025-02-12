import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import WebPlayback from "../../components/WebPlayback/WebPlayback";
import BackButton from "../BackButton/BackButton";
import ConfirmationPopup from "../ConfirmationPopup/ConfirmationPopup";
import "./PlayGame.css";

const PlayGame = () => {
  // Pass genre via state or query param, and grab it here
  // Ex, use Link with `state={{ genre: "ROCK" }}`
  // const location = useLocation();
  // const { genre } = location.state || {};
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);

  // If user tries to “go back,” we intercept and show the modal
  const handleBack = () => {
    setShowConfirm(true);
  };

  // Called when user clicks “BACK TO LOBBY”
  const confirmLeave = () => {
    navigate("/");
  };

  // Called if user cancels or clicks outside
  const cancelLeave = () => {
    setShowConfirm(false);
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get("token");

    if (accessToken) {
      setToken(accessToken); // Store token in state or context
    }
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get("token");

    if (accessToken) {
      setToken(accessToken); // Store token in state or context
    }
  });

  return (
    <div className="play-game-container">
      <Navbar />

      <BackButton to="#" onClick={handleBack} />

      <div className="countdown-circle">10</div>

      <div className="guess-overlay">
        <h2 className="guess-title">GUESS THE SONG!</h2>
        <div className="overlay-panel">
          <h2 className="overlay-title">Game</h2>
          <WebPlayback token={token} />
        </div>
        <p className="score-missed">Score: 0</p>
        <p className="score-missed">Missed: 0</p>

        {/* TODO - import icon */}
        <div className="question-icon">?</div>
        <input type="text" placeholder="Type here..." className="guess-input" />
      </div>

      <div className="audio-controls">
        {/* TODO - import icon */}
        <button>🔈</button>
        {/* TODO - fix stlying */}
        <input type="range" min="0" max="100" />
      </div>

      {showConfirm && (
        <ConfirmationPopup onConfirm={confirmLeave} onCancel={cancelLeave} />
      )}
    </div>
  );
};

export default PlayGame;
