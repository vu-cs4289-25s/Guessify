import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import { useGameContext } from "../../components/GameContext";
import "./GameModeSelect.css";

const GameModeSelect = () => {
  const { setGameMode } = useGameContext();

  const handleClick = async (mode) => {
    setGameMode(mode);
    console.log("Mode:", mode);
  };

  return (
    <div className="game-mode-container">
      <Navbar />
      <BackButton to="/" />

      <div className="game-mode-overlay">
        <div>
          <Link
            to="/game/genres"
            className="game-mode-button"
            onClick={() => handleClick("single")}
          >
            SINGLEPLAYER
          </Link>
          <br />
          <br />
          <button
            className="game-mode-button disabled"
            onClick={() => handleClick("multi")}
            disabled
          >
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
