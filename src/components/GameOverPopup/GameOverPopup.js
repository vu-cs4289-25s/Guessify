import React from "react";
import { useParams } from "react-router-dom";
import "./GameOverPopup.css";

const GameOverPopup = ({ mode = "single" }) => {
  const { roomCode } = useParams();

  const handleViewResults = () => {
    const path =
      mode === "multi" ? `/game/gameover-multi/${roomCode}` : "/game-over";
    window.location.href = path;
  };

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-content">
        <h1>GAME OVER!</h1>
        <button className="view-results-button" onClick={handleViewResults}>
          VIEW RESULTS
        </button>
      </div>
    </div>
  );
};

export default GameOverPopup;
