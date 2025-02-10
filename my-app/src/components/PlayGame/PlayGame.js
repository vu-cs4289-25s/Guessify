import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import "./PlayGame.css";

const PlayGame = () => {
  // Pass genre via state or query param, and grab it here
  // Ex, use Link with `state={{ genre: "ROCK" }}`
  // const location = useLocation();
  // const { genre } = location.state || {};

  return (
    <div className="play-game-container">
      <Navbar />
      <BackButton to="/game/genres" />

      <div className="countdown-circle">10</div>

      <div className="guess-overlay">
        <h2 className="guess-title">GUESS THE SONG!</h2>
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
    </div>
  );
};

export default PlayGame;
