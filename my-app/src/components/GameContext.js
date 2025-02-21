import React, { createContext, useState, useContext } from "react";

// Create the context
const GameContext = createContext();

// Create a provider component
export const GameProvider = ({ children }) => {
  const [gameMode, setGameMode] = useState("");
  const [gameGenre, setGameGenre] = useState("");

  return (
    <GameContext.Provider
      value={{ gameMode, setGameMode, gameGenre, setGameGenre }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);
