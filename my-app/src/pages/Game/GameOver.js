import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import { Link } from "react-router-dom";

const GameOver = () => {
  return (
    <div className="game-over-container">
      <Navbar />
      <h1>Game Over!</h1>
      {/* <p>Your final score is: {score}</p> */}
      <Link to="/" className="game-mode-button">
        Return Home
      </Link>
    </div>
  );
};

export default GameOver;
