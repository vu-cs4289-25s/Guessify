import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import "./MultiplayerModeSelect.css";

const MultiplayerModeSelect = () => {
  return (
    <div className="game-mode-container">
      {" "}
      {/* Reuse same class for consistency */}
      <Navbar />
      <BackButton to="/game" />
      <div className="multiplayer-mode-overlay">
        {" "}
        {/* Reuse same overlay style */}
        <div>
          <Link to="/game/create-room" className="game-mode-button">
            CREATE ROOM
          </Link>
          <br />
          <br />
          <Link to="/game/join-room" className="game-mode-button">
            JOIN ROOM
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerModeSelect;
