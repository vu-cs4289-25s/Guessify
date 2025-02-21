import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import GameContext, { GameProvider } from "../../components/GameContext";
import GameModeSelect from "../../components/GameModeSelect/GameModeSelect";
import GenreSelect from "../../components/GenreSelect/GenreSelect";
import PlayGame from "../../components/PlayGame/PlayGame";

import "./Game.css";

const Game = () => {
  return (
    <div className="game-container">
      <Navbar />
      <GameProvider>
        <Routes>
          <Route index element={<GameModeSelect />} />
          <Route path="genres" element={<GenreSelect />} />
          <Route path="play" element={<PlayGame />} />
        </Routes>
      </GameProvider>
    </div>
  );
};

export default Game;
