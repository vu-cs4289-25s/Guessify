// src/components/Multiplayer/MultiplayerModeSelect.js
import React from "react";
import { Link } from "react-router-dom";
import BackButton from "../BackButton/BackButton";
import Navbar from "../Navbar/Navbar";

const MultiplayerModeSelect = () => {
  return (
    <div className="multiplayer-mode-container">
      <Navbar />
      <BackButton to="/game" />

      <h2>Select Multiplayer Option</h2>
      <Link to="/game/create-room" className="game-mode-button">
        CREATE ROOM
      </Link>
      <Link to="/game/join-room" className="game-mode-button">
        JOIN ROOM
      </Link>
    </div>
  );
};

export default MultiplayerModeSelect;
