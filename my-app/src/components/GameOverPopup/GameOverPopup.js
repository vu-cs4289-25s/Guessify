import React from "react";
import "./GameOverPopup.css";

const GameOverPopup = () => {
  // Function to handle button click and reload the page
  const handleViewResults = () => {
    window.location.href = "/game-over"; // Reload the page to stop the music and navigate
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
