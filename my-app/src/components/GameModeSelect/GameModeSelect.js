import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import "./GameModeSelect.css";

const GameModeSelect = () => {
  return (
    <div className="game-mode-container">
      <Navbar />
      <BackButton to="/" />

      <div className="game-mode-overlay">
        <div>
          <Link to="/game/genres" className="game-mode-button">
            SINGLEPLAYER
          </Link>
          <br />
          <br />
          <button className="game-mode-button disabled" disabled>
            MULTIPLAYER
            <br />
            <span className="game-mode-coming-soon-text">(COMING SOON!)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameModeSelect;
